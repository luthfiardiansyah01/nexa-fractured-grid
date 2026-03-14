import Phaser from 'phaser';
import { socketService } from '../../services/socket';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
    this.players = {};
  }

  create() {
    this.socket = socketService.socket;
    
    const username = this.game.registry.get('username') || 'Player';
    // Join game
    this.socket.emit('joinGame', { username });

    // Handle game state
    this.socket.on('gameState', (state) => {
      this.renderMap(state.district);
      Object.values(state.players).forEach(p => this.addPlayer(p));
    });

    this.socket.on('playerJoined', (player) => {
      this.addPlayer(player);
    });

    this.socket.on('playerMoved', (data) => {
      // Validate incoming data
      if (data && data.id && typeof data.x === 'number' && typeof data.y === 'number') {
        if (this.players[data.id]) {
          this.players[data.id].setPosition(data.x, data.y);
        }
      }
    });

    this.socket.on('playerLeft', (id) => {
      if (this.players[id]) {
        this.players[id].destroy();
        delete this.players[id];
      }
    });

    this.socket.on('districtUpdate', (data) => {
        if (!data || !data.tile) return;
        const { tile } = data;
        this.updateTile(tile);
    });

    this.socket.on('startPuzzle', (data) => {
        // Trigger React UI navigation
        const onPuzzleTrigger = this.game.registry.get('onPuzzleTrigger');
        if (onPuzzleTrigger) {
            onPuzzleTrigger(data);
        }
    });

    this.socket.on('gameReset', () => {
        // Reload scene or reset local state
        this.scene.restart();
    });

    // Input
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // My player logic
    this.myPlayerId = this.socket.id;
  }

  update() {
    if (!this.players[this.socket.id]) return;

    const speed = 4;
    const myPlayer = this.players[this.socket.id];
    let moved = false;
    let dx = 0;
    let dy = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      dx = -speed;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      dx = speed;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      dy = -speed;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      dy = speed;
    }

    if (dx !== 0 || dy !== 0) {
        myPlayer.x += dx;
        myPlayer.y += dy;
        moved = true;
        // Simple bounds checking could go here
    }

    // Limit socket emissions to prevent flooding
    if (moved) {
      const now = Date.now();
      if (!this.lastMoveTime) this.lastMoveTime = 0;
      if (now - this.lastMoveTime > 50) { // 50ms = 20 updates/sec
        this.socket.emit('playerMove', { x: myPlayer.x, y: myPlayer.y });
        this.lastMoveTime = now;
      }
    }
  }

  updateTile(tile) {
    const key = `${tile.x}-${tile.y}`;
    
    let texture = 'grass';
    if (tile.type === 1) texture = 'road';
    if (tile.type === 2) texture = 'pipe';
    if (tile.type === 3) texture = 'blocked_pipe';
    if (tile.type === 4) texture = 'water';

    if (!this.mapTiles) this.mapTiles = {};

    if (this.mapTiles[key]) {
        // Optimize: just update the texture instead of recreating the sprite
        this.mapTiles[key].setTexture(texture);
    } else {
        const sprite = this.add.sprite(tile.x * 32 + 16, tile.y * 32 + 16, texture);
        sprite.setInteractive();
        sprite.on('pointerdown', () => {
          this.handleInteraction(tile.x, tile.y);
        });
        this.mapTiles[key] = sprite;
    }
  }

  addPlayer(playerData) {
    if (this.players[playerData.id]) return;
    const sprite = this.add.sprite(playerData.x, playerData.y, 'player');
    this.players[playerData.id] = sprite;
  }

  renderMap(district) {
    // Initial render
    this.mapTiles = {};
    district.tiles.forEach(row => {
      row.forEach(tile => {
        this.updateTile(tile);
      });
    });
  }

  handleInteraction(x, y) {
    // Only allow interaction if close enough?
    const myPlayer = this.players[this.socket.id];
    if (myPlayer) {
        const dist = Phaser.Math.Distance.Between(myPlayer.x, myPlayer.y, x * 32 + 16, y * 32 + 16);
        if (dist < 64) { // Interaction range
            this.socket.emit('interact', { x, y, type: 'repair' });
        }
    }
  }
}