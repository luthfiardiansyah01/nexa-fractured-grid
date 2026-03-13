class Player {
  constructor(id, username, district) {
    this.id = id;
    this.username = username || `Player_${id.substr(0, 4)}`;
    this.x = 100; // Default spawn X
    this.y = 100; // Default spawn Y
    this.currentDistrict = district;
    this.level = 1;
    this.xp = 0;
    this.coins = 0;
    this.inventory = ['wrench']; // Starter item
  }

  move(x, y) {
    this.x = x;
    this.y = y;
  }

  getState() {
    return {
      id: this.id,
      username: this.username,
      x: this.x,
      y: this.y,
      district: this.currentDistrict
    };
  }
}

module.exports = Player;
