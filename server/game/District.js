class District {
  constructor(name, width, height) {
    this.name = name;
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    this.tiles = this.generateMap(this.width, this.height);
    this.waterLevel = 0;
  }

  generateMap(w, h) {
    const tiles = [];
    // Constants for Tile Types
    // 0: Grass, 1: Road, 2: Pipe, 3: Blocked Pipe, 4: Water Source
    for (let y = 0; y < h; y++) {
      const row = [];
      for (let x = 0; x < w; x++) {
        // Simple procedural generation
        let type = 0;
        
        // Create a central road
        if (x === Math.floor(w/2) || y === Math.floor(h/2)) {
          type = 1;
        } 
        // Create a grid of roads
        else if (x % 5 === 0 || y % 5 === 0) {
          type = 1;
        } 
        else {
          // Random pipes in between
          const rand = Math.random();
          if (rand > 0.6) {
             type = 2; // Pipe
             // Chance for blockage
             if (Math.random() > 0.7) type = 3; 
          }
        }
        
        // Add water sources at specific points (e.g., corners of blocks)
        if (type === 0 && Math.random() > 0.97) type = 4;

        row.push({ x, y, type, water: 0 });
      }
      tiles.push(row);
    }
    return tiles;
  }

  handleInteraction(player, action) {
    const { x, y, type } = action;
    
    // Bounds check
    if (y < 0 || y >= this.height || x < 0 || x >= this.width) return { success: false };

    const tile = this.tiles[y][x];
    
    if (type === 'repair') {
      if (tile.type === 3) { // Blocked/Broken Pipe
        // Instead of instant fix, require puzzle
        return { success: true, requiresPuzzle: true, tile };
      }
    } else if (type === 'puzzle_solved') {
       if (tile.type === 3) {
         tile.type = 2; // Fixed pipe
         this.waterLevel = Math.max(0, this.waterLevel - 20); // More dramatic reduction
         return { success: true, solved: true, tile };
       }
    }
    
    return { success: false };
  }

  simulateWaterFlow() {
    // Basic water flow logic
    // Water flows from high pressure to low pressure
    // Or simply spreads to adjacent tiles if not blocked
    
    // For this prototype, we'll simulate rain increasing water level
    // and drainage reducing it
    
    // Random rain
    if (Math.random() > 0.999) {
      this.waterLevel += 1;
    }

    // Drainage system effect
    let drainageCapacity = 0;
    this.tiles.forEach(row => {
      row.forEach(tile => {
        if (tile.type === 2) { // Pipe
          drainageCapacity += 0.5;
        } else if (tile.type === 3) { // Blocked Pipe
          drainageCapacity -= 0.2; // Blockage causes backup
        }
      });
    });

    // Reduce water level based on drainage
    if (this.waterLevel > 0) {
      this.waterLevel -= drainageCapacity * 0.1;
      if (this.waterLevel < 0) this.waterLevel = 0;
    }

    // Flood event trigger
    if (this.waterLevel > 80) {
      // Trigger flood warning via GameManager (not implemented here directly)
      // Return status for GameManager to use
      return { flooding: true, level: this.waterLevel };
    }
    
    return { flooding: false, level: this.waterLevel };
  }

  getState() {
    return {
      name: this.name,
      width: this.width,
      height: this.height,
      tiles: this.tiles,
      waterLevel: this.waterLevel
    };
  }
}

module.exports = District;
