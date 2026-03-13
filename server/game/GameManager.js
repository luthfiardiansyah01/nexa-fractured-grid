const Player = require('./Player');
const District = require('./District');

class GameManager {
  constructor(io) {
    this.io = io;
    this.players = {}; // { socketId: Player }
    this.districts = {
      'OldTown': new District('OldTown', 20, 20),
      'IndustrialZone': new District('IndustrialZone', 25, 25)
    };
    
    // Game Loop
    setInterval(() => {
      try {
        this.update();
      } catch (err) {
        console.error('Error in Game Loop:', err);
      }
    }, 1000 / 60); // 60 FPS update loop
  }

  handleConnection(socket) {
    socket.on('joinGame', (userData) => {
      // Prevent double join
      if (this.players[socket.id]) return;

      // Validate username
      let safeUsername = (userData.username || '').trim().substring(0, 15);
      if (!safeUsername) safeUsername = `Player_${socket.id.substr(0, 4)}`;
      
      const player = new Player(socket.id, safeUsername, 'OldTown');
      this.players[socket.id] = player;
      
      // Send initial state
      socket.emit('gameState', {
        players: this.getPlayersState(),
        district: this.districts[player.currentDistrict].getState()
      });

      // Notify others
      socket.broadcast.emit('playerJoined', player.getState());
    });

    socket.on('playerMove', (moveData) => {
      const player = this.players[socket.id];
      if (player && typeof moveData.x === 'number' && typeof moveData.y === 'number') {
        // Simple speed hack validation (naive)
        const dx = moveData.x - player.x;
        const dy = moveData.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 50) { // Max speed allowance per tick
            player.move(moveData.x, moveData.y);
            this.io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
        }
      }
    });

    socket.on('interact', (actionData) => {
      const player = this.players[socket.id];
      if (player && typeof actionData.x === 'number' && typeof actionData.y === 'number') {
        const district = this.districts[player.currentDistrict];
        // Validate Interaction Range
        const tileX = actionData.x * 32 + 16;
        const tileY = actionData.y * 32 + 16;
        const dist = Math.sqrt(Math.pow(tileX - player.x, 2) + Math.pow(tileY - player.y, 2));

        if (dist < 100) { // Allow slight buffer over client's 64
             const result = district.handleInteraction(player, actionData);
             
             if (result.success) {
               if (result.requiresPuzzle) {
                  socket.emit('startPuzzle', { x: actionData.x, y: actionData.y });
               } else if (result.solved) {
                 this.io.emit('districtUpdate', { 
                   districtName: player.currentDistrict, 
                   tile: result.tile 
                 });
                 // Reward player
                 player.xp += 50;
                 player.coins += 20;
                 socket.emit('playerUpdate', player.getState());
               }
             }
        }
      }
    });

    socket.on('puzzleSolved', (data) => {
       const player = this.players[socket.id];
       if (player) {
         // Trust client for now (MVP), but should validate puzzle token
         const district = this.districts[player.currentDistrict];
         const result = district.handleInteraction(player, { x: data.x, y: data.y, type: 'puzzle_solved' });
         
         if (result.success && result.solved) {
            this.io.emit('districtUpdate', { 
              districtName: player.currentDistrict, 
              tile: result.tile 
            });
            // Reward player
            player.xp += 100;
            player.coins += 50;
            socket.emit('playerUpdate', player.getState());
         }
       }
    });

    socket.on('resetGame', () => {
      // Admin only function in prod, open for all in dev
      console.log('Resetting Game State...');
      Object.values(this.districts).forEach(d => d.reset());
      Object.values(this.players).forEach(p => {
        p.x = 100;
        p.y = 100;
        p.xp = 0;
        p.coins = 0;
      });
      
      this.io.emit('gameReset');
      // Resend initial state
      this.io.emit('gameState', {
        players: this.getPlayersState(),
        district: this.districts['OldTown'].getState() // Default
      });
    });
  }

  handleDisconnect(socket) {
    if (this.players[socket.id]) {
      delete this.players[socket.id];
      this.io.emit('playerLeft', socket.id);
    }
  }

  update() {
    // Basic game loop update logic
    Object.entries(this.districts).forEach(([name, district]) => {
      const status = district.simulateWaterFlow();
      
      // Periodically send updates, not every frame
      // Or send only if critical change
      if (Math.random() > 0.98) { // Approx once per second at 60fps
         this.io.emit('districtStatus', { 
           name, 
           waterLevel: status.level, 
           flooding: status.flooding 
         });
      }
    });
  }

  getPlayersState() {
    const state = {};
    for (const id in this.players) {
      state[id] = this.players[id].getState();
    }
    return state;
  }
}

module.exports = GameManager;
