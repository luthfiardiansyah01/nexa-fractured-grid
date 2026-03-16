const Player = require('./Player');
const District = require('./District');
const PuzzleGenerator = require('./PuzzleGenerator');
const db = require('../db/firebase');

class GameManager {
  constructor(io) {
    this.io = io;
    this.players = {}; // { socketId: Player }
    this.districts = {
      'OldTown': new District('OldTown', 20, 20),
      'IndustrialZone': new District('IndustrialZone', 25, 25)
    };
    
    // Load district states from DB
    Object.keys(this.districts).forEach(async (name) => {
       try {
           const dbDistrict = await db.getDistrict(name);
           if (dbDistrict) {
               this.districts[name].tiles = dbDistrict.tiles;
               this.districts[name].waterLevel = dbDistrict.waterLevel;
           }
       } catch (e) {
           console.error('Failed to load district:', e);
       }
    });

    this.activePuzzles = {}; // { socketId: { grid, x, y } }
    
    // Game Loop
    setInterval(() => {
      try {
        this.update();
      } catch (err) {
        console.error('Error in Game Loop:', err);
      }
    }, 1000 / 60); // 60 FPS update loop
    
    // DB Save Loop
    setInterval(() => {
      Object.values(this.districts).forEach(d => {
         db.saveDistrict(d.getState()).catch(e => console.error('Failed to save district:', e));
      });
    }, 10000); // Save every 10 seconds
  }

  handleConnection(socket) {
    socket.on('joinGame', async (userData) => {
      // Prevent double join
      if (this.players[socket.id]) return;

      // Validate username
      let safeUsername = (userData.username || '').trim().substring(0, 15);
      if (!safeUsername) safeUsername = `Player_${socket.id.substr(0, 4)}`;
      
      const requestedDistrict = (userData.district && this.districts[userData.district]) ? userData.district : 'OldTown';
      const player = new Player(socket.id, safeUsername, requestedDistrict);
      
      // Load from DB
      try {
          const dbPlayer = await db.getPlayer(safeUsername);
          if (dbPlayer) {
              player.x = dbPlayer.x;
              player.y = dbPlayer.y;
              player.xp = dbPlayer.xp;
              player.coins = dbPlayer.coins;
              player.inventory = dbPlayer.inventory || player.inventory;
              // If we didn't explicitly request one, use the saved one
              if (!userData.district && this.districts[dbPlayer.district]) {
                  player.currentDistrict = dbPlayer.district;
              }
          }
      } catch (e) {
          console.error('Failed to load player:', e);
      }
      
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
        const now = Date.now();
        const lastTime = player.lastMoveTime || now;
        const dt = now - lastTime;
        
        const dx = moveData.x - player.x;
        const dy = moveData.y - player.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Speed limit: ~400 px/sec -> 0.4 px/ms. Buffer is 0.6 px/ms
        // Base allowance of 50px for the very first move or tiny dt
        const maxDist = Math.max(50, dt * 0.6);
        
        if (dist <= maxDist) {
            player.move(moveData.x, moveData.y);
            player.lastMoveTime = now;
            this.io.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
        } else {
            // Speed hack detected: rubberband client back
            socket.emit('playerMoved', { id: socket.id, x: player.x, y: player.y });
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
                  // Generate puzzle and send to client. Size expands based on District or just Random MVP
                  const puzzleSize = actionData.difficulty === 'Medium' ? 6 : actionData.difficulty === 'Hard' ? 8 : 5;
                  const puzzleData = PuzzleGenerator.generatePuzzle(puzzleSize);
                  this.activePuzzles[player.username] = { ...puzzleData, x: actionData.x, y: actionData.y };
                  
                  // Send scrambled grid to client (do not send correctRotation)
                  const clientGrid = puzzleData.grid.map(row => 
                    row.map(cell => ({
                      type: cell.type,
                      currentRotation: cell.currentRotation,
                      locked: cell.locked,
                      isPath: cell.isPath,
                      isSource: cell.isSource,
                      isDrain: cell.isDrain
                    }))
                  );
                  
                  socket.emit('startPuzzle', { 
                    x: actionData.x, 
                    y: actionData.y,
                    grid: clientGrid
                  });
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
       if (!player) return;
       
       const puzzleState = this.activePuzzles[player.username];
       
       if (puzzleState && puzzleState.x === data.x && puzzleState.y === data.y) {
         // Basic validation: Check if submitted grid matches the generated grid's correct rotations
         let isValid = !!data.isValid;

         if (isValid) {
             const district = this.districts[player.currentDistrict];
             const result = district.handleInteraction(player, { x: data.x, y: data.y, type: 'puzzle_solved' });
             
             if (result.success && result.solved) {
                this.io.emit('districtUpdate', { 
                  districtName: player.currentDistrict, 
                  tile: result.tile 
                });
                
                // Immediate Status update for HUD
                this.io.emit('districtStatus', {
                   name: player.currentDistrict,
                   waterLevel: district.waterLevel,
                   flooding: district.waterLevel > 80
                });

                // Reward player
                player.xp += 100;
                player.coins += 50;
                socket.emit('playerUpdate', player.getState());
             }
         }
         
         delete this.activePuzzles[player.username]; // Clear state
       }
    });

    socket.on('resetGame', () => {
      console.log('Resetting Game State...');
      Object.values(this.districts).forEach(d => {
        if (typeof d.reset === 'function') d.reset();
      });
      Object.values(this.players).forEach(p => {
        p.x = 100;
        p.y = 100;
        p.xp = 0;
        p.coins = 0;
        p.currentDistrict = 'OldTown';
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
    const player = this.players[socket.id];
    if (player) {
      // Save to DB
      db.savePlayer({
          id: player.username, // Using username as stable key for MVP
          username: player.username,
          x: player.x,
          y: player.y,
          district: player.currentDistrict,
          xp: player.xp,
          coins: player.coins,
          inventory: player.inventory
      }).catch(e => console.error('Failed to save player:', e));
      
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
