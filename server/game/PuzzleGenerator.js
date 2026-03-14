class PuzzleGenerator {
  static generatePuzzle(size = 5) {
    const grid = Array(size).fill(null).map(() => Array(size).fill(null));
    const start = { x: Math.floor(Math.random() * size), y: 0 }; // Top
    const end = { x: Math.floor(Math.random() * size), y: size - 1 }; // Bottom
    
    // Create a path using Random Walk or A* (simplified here)
    let current = { ...start };
    const path = [current];
    
    while (current.x !== end.x || current.y !== end.y) {
      const moves = [];
      if (current.y < end.y) moves.push({ x: current.x, y: current.y + 1 }); // Downward bias
      if (current.x < end.x) moves.push({ x: current.x + 1, y: current.y }); // Right
      if (current.x > 0) moves.push({ x: current.x - 1, y: current.y }); // Left
      
      // Add randomness but heavily bias towards goal (downwards)
      if (Math.random() > 0.5 && current.y < end.y) {
        moves.push({ x: current.x, y: current.y + 1 });
        moves.push({ x: current.x, y: current.y + 1 });
      }
      // Prevent moving up unless stuck (we don't push UP moves here to simplify)
      
      const next = moves[Math.floor(Math.random() * moves.length)];
      if (!next) break; // Should not happen with valid logic
      
      current = next;
      path.push(current);
    }
    
    // Fill grid based on path
    for (let i = 0; i < path.length; i++) {
      const p = path[i];
      const prev = i > 0 ? path[i-1] : null;
      const next = i < path.length - 1 ? path[i+1] : null;
      
      let type = 'straight';
      let rotation = 0;
      
      if (!prev) { // Start
        if (next.x > p.x) rotation = 270; // Right
        else if (next.x < p.x) rotation = 90; // Left
        else if (next.y > p.y) rotation = 0; // Down
      } else if (!next) { // End
        if (prev.x < p.x) rotation = 270; // Left input
        else if (prev.x > p.x) rotation = 90; // Right input
        else if (prev.y < p.y) rotation = 0; // Top input
      } else {
        // Determine type based on prev and next
        const dx1 = p.x - prev.x;
        const dy1 = p.y - prev.y;
        const dx2 = next.x - p.x;
        const dy2 = next.y - p.y;
        
        if (dx1 === dx2 && dy1 === dy2) {
          type = 'straight';
          rotation = dx1 !== 0 ? 90 : 0;
        } else {
          type = 'corner';
          // Logic for corner rotation would be more complex, simplifying for MVP
          // Just randomize workable corners or set a default
          rotation = 0; 
        }
      }
      
      grid[p.y][p.x] = { type, rotation, locked: false, isPath: true };
    }
    
    // Fill empty spots with random noise
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!grid[y][x]) {
          const types = ['straight', 'corner', 't-shape', 'cross'];
          const type = types[Math.floor(Math.random() * types.length)];
          const rotation = Math.floor(Math.random() * 4) * 90;
          grid[y][x] = { type, rotation, locked: false, isPath: false };
        }
      }
    }

    // Scramble rotations for the puzzle aspect
    const puzzleGrid = grid.map((row, y) => row.map((cell, x) => ({
      ...cell,
      currentRotation: Math.floor(Math.random() * 4) * 90,
      correctRotation: cell.rotation, // Store solution if needed for validation
      isSource: x === start.x && y === start.y,
      isDrain: x === end.x && y === end.y
    })));

    return { grid: puzzleGrid, start, end };
  }
}

module.exports = PuzzleGenerator;
