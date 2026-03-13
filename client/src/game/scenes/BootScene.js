import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Load assets here
    // this.load.image('logo', 'assets/logo.png');
    
    // Create simple graphics for tiles if assets are missing
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // Grass
    graphics.fillStyle(0x4caf50);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('grass', 32, 32);
    
    // Road
    graphics.clear();
    graphics.fillStyle(0x7f8c8d);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('road', 32, 32);

    // Pipe
    graphics.clear();
    graphics.fillStyle(0x3498db);
    graphics.fillRect(10, 0, 12, 32);
    graphics.generateTexture('pipe', 32, 32);

    // Blocked Pipe
    graphics.clear();
    graphics.fillStyle(0xe74c3c);
    graphics.fillRect(10, 0, 12, 32);
    graphics.generateTexture('blocked_pipe', 32, 32);

    // Water Source
    graphics.clear();
    graphics.fillStyle(0x34495e);
    graphics.fillRect(0, 0, 32, 32);
    graphics.fillStyle(0x3498db);
    graphics.fillCircle(16, 16, 12);
    graphics.generateTexture('water', 32, 32);

    // Player
    graphics.clear();
    graphics.fillStyle(0xf1c40f);
    graphics.fillCircle(16, 16, 14);
    graphics.generateTexture('player', 32, 32);
  }

  create() {
    this.scene.start('MainScene');
  }
}
