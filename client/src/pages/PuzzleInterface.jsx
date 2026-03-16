import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { socketService } from '../services/socket';

const getPorts = (type, rotation) => {
  const rotIdx = (rotation / 90) % 4; 
  let ports = [];
  if (type === 'straight') ports = [0, 2];
  if (type === 'corner') ports = [1, 2];
  if (type === 't-shape') ports = [0, 1, 2];
  if (type === 'cross') ports = [0, 1, 2, 3];
  return ports.map(p => (p + rotIdx) % 4);
};

// Helper to calculate water flow in a grid
const calculateFlow = (currentGrid) => {
  const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell, hasWater: false, isLeak: false })));
  
  let sourceCell = null;
  for(let y=0; y<newGrid.length; y++) {
    for(let x=0; x<newGrid[y].length; x++) {
      if (newGrid[y][x].isSource) {
        sourceCell = newGrid[y][x];
        break;
      }
    }
    if (sourceCell) break;
  }
  
  if (!sourceCell) return { grid: newGrid, drainReached: false };

  const queue = [sourceCell];
  sourceCell.hasWater = true;
  let drainReached = false;

  const neighbors = [
    { dx: 0, dy: -1, port: 0, matchingPort: 2 },
    { dx: 1, dy: 0, port: 1, matchingPort: 3 },
    { dx: 0, dy: 1, port: 2, matchingPort: 0 },
    { dx: -1, dy: 0, port: 3, matchingPort: 1 }
  ];

  while (queue.length > 0) {
    const current = queue.shift();
    const currentPorts = getPorts(current.type, current.rotation);
    
    currentPorts.forEach(portDir => {
      const nav = neighbors[portDir];
      const nx = current.x + nav.dx;
      const ny = current.y + nav.dy;
      
      if (ny >= 0 && ny < newGrid.length && nx >= 0 && nx < newGrid[0].length) {
         const neighbor = newGrid[ny][nx];
         const neighborPorts = getPorts(neighbor.type, neighbor.rotation);
         
         if (neighborPorts.includes(nav.matchingPort)) {
           if (!neighbor.hasWater) {
             neighbor.hasWater = true;
             queue.push(neighbor);
             if (neighbor.isDrain) drainReached = true;
           }
         } else {
           current.isLeak = true;
         }
      } else {
         current.isLeak = true;
      }
    });
  }

  return { grid: newGrid, drainReached };
};

const PuzzleTile = React.memo(({ piece, onClick, isSolved }) => {
  const getPipeBaseColor = (p) => {
    if (isSolved || p.hasWater) return 'bg-blue-400';
    if (p.isLeak) return 'bg-red-400';
    return 'bg-gray-500';
  };

  return (
    <div 
      onClick={() => onClick(piece.x, piece.y)}
      className={`
        relative w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-gray-800 rounded-lg 
        ${piece.isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700/80 active:scale-90'} 
        ${piece.hasWater ? 'shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10 border border-blue-400/30' : ''}
        ${piece.isLeak ? 'shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10 border border-red-400/30' : ''}
        ${isSolved ? 'pointer-events-none' : ''}
        transition-all duration-150 overflow-hidden flex items-center justify-center
      `}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
        style={{ transform: `rotate(${piece.rotation}deg)` }}
      >
        <div className={`absolute ${getPipeBaseColor(piece)} shadow-inner
            ${piece.hasWater ? 'bg-gradient-to-b from-blue-300 to-blue-500' : ''}
          `}
          style={{
            width: piece.type === 'straight' ? '30%' : piece.type === 'cross' ? '100%' : '30%',
            height: piece.type === 'straight' ? '100%' : piece.type === 'cross' ? '30%' : '100%',
            left: piece.type === 'corner' ? '35%' : piece.type === 'cross' ? '0' : '35%',
            top: piece.type === 'cross' ? '35%' : '0',
            borderRadius: piece.type === 'corner' ? '0 0 0 50%' : '0'
          }}
        />
         {piece.type === 'cross' && (
            <div className={`absolute ${getPipeBaseColor(piece)} shadow-inner ${piece.hasWater ? 'bg-gradient-to-r from-blue-300 to-blue-500' : ''}`}
              style={{ width: '30%', height: '100%', left: '35%', top: '0' }}
            />
         )}
         {piece.type === 'corner' && (
            <div className={`absolute ${getPipeBaseColor(piece)} shadow-inner ${piece.hasWater ? 'bg-gradient-to-r from-blue-300 to-blue-500' : ''}`}
              style={{ width: '100%', height: '30%', left: '35%', top: '35%' }}
            />
         )}
         {piece.type === 't-shape' && (
            <>
             <div className={`absolute ${getPipeBaseColor(piece)} shadow-inner ${piece.hasWater ? 'bg-gradient-to-b from-blue-300 to-blue-500' : ''}`}
                style={{ width: '30%', height: '100%', left: '35%', top: '0' }}
             />
             <div className={`absolute ${getPipeBaseColor(piece)} shadow-inner ${piece.hasWater ? 'bg-gradient-to-r from-blue-300 to-blue-500' : ''}`}
                style={{ width: '65%', height: '30%', left: '35%', top: '35%' }}
             />
            </>
         )}
      </div>

      {piece.isSource && (
         <div className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] font-bold px-1 rounded shadow-lg animate-pulse z-20">S</div>
      )}
      {piece.isDrain && (
         <div className="absolute bottom-1 right-1 bg-purple-600 text-white text-[9px] font-bold px-1 rounded shadow-lg z-20">D</div>
      )}

      {piece.hasWater && (
        <div className="absolute inset-0 bg-blue-400/20 mix-blend-overlay animate-pulse pointer-events-none z-20"></div>
      )}
      
      {piece.isLeak && !isSolved && (
         <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay animate-[ping_1.5s_infinite] pointer-events-none z-20 border border-red-500/50 rounded-lg"></div>
      )}
    </div>
  );
});

const PuzzleInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { x, y, grid: initialGrid } = location.state || {};

  const [grid, setGrid] = useState([]);
  const [generating, setGenerating] = useState(true);
  
  const [floodLevel, setFloodLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isSolved, setIsSolved] = useState(false);
  const [successGlow, setSuccessGlow] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  
  const districtName = localStorage.getItem('current_district') || 'Unknown Sector';
  const playerXp = localStorage.getItem('player_xp') || 1250;
  const playerCoins = localStorage.getItem('player_coins') || 450;

  useEffect(() => {
    socketService.connect(); // Ensure we have a socket connected
    startGeneration();
  }, []);

  useEffect(() => {
    if (generating || isSolved || isFailed) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleFail("Critical Time Out! System locked.");
          return 0;
        }
        return prev - 1;
      });
      
      setFloodLevel(prev => {
        const next = prev + 1.2;
        if (next >= 100) {
          handleFail("CRITICAL FLOOD! District breached.");
          return 100;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [generating, isSolved, isFailed]);

  const startGeneration = () => {
    setGenerating(true);
    setFloodLevel(0);
    setTimeLeft(60);
    setIsSolved(false);
    setIsFailed(false);
    setRewardData(null);

    setTimeout(() => {
      if (initialGrid) {
          const uiGrid = initialGrid.map((row, cy) => 
            row.map((cell, cx) => ({
              id: `${cx}-${cy}`,
              x: cx, y: cy,
              type: cell.type,
              rotation: cell.currentRotation,
              isLocked: cell.locked,
              isSource: cell.isSource,
              isDrain: cell.isDrain,
              hasWater: false,
              isLeak: false
            }))
          );
          const { grid: flowGrid } = calculateFlow(uiGrid);
          setGrid(flowGrid);
      } else {
        handleFail("ERROR: No valid network topography provided by server.");
        return;
      }
      setGenerating(false);
    }, 600);
  };

  const handleFail = (message) => {
    setIsFailed(true);
    setTimeout(() => {
      alert(message);
      navigate('/city-map');
    }, 2000);
  };

  const handleSuccess = (finalGrid) => {
    setIsSolved(true);
    setSuccessGlow(true);
    
    // Send to server
    if (x !== undefined && y !== undefined) {
      socketService.emit('puzzleSolved', { x, y, clientGrid: finalGrid, isValid: true });
    }
    
    // Simulate Reward/Delay for animation
    setTimeout(() => {
      setSuccessGlow(false);
      setRewardData({
        xp: 120,
        coins: 80,
        floodReduction: Math.floor(floodLevel)
      });
    }, 1500); 
  };

  // Optimized rotatePiece using useCallback
  const rotatePiece = React.useCallback((cx, cy) => {
    if (generating || isFailed || isSolved) return;
    
    setGrid(prevGrid => {
      // Shallow copy for rows, but only deep copy the affected row/cell
      const newGrid = [...prevGrid];
      const newRow = [...newGrid[cy]];
      const piece = { ...newRow[cx] };
      
      if (piece.isLocked) return prevGrid;

      piece.rotation = (piece.rotation + 90) % 360;
      newRow[cx] = piece;
      newGrid[cy] = newRow;

      // Recalculate flow immediately
      const { grid: flowGrid, drainReached } = calculateFlow(newGrid);
      
      if (drainReached) {
        // Trigger success outside the state update to avoid side effects in render
        setTimeout(() => handleSuccess(flowGrid), 0);
      }

      return flowGrid;
    });
  }, [generating, isFailed, isSolved]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white relative overflow-hidden font-sans selection:bg-blue-500/30">
      
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-gray-900 to-black pointer-events-none"></div>
      
      <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-20 pointer-events-none">
        <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-4 shadow-xl backdrop-blur-md pointer-events-auto min-w-[280px]">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 uppercase tracking-wider mb-2">
            {districtName}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-gray-400">FLOOD PRESSURE</span>
                <span className={`${floodLevel > 80 ? 'text-red-500 animate-pulse' : 'text-blue-400'}`}>
                  {Math.floor(floodLevel)}%
                </span>
              </div>
              <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${floodLevel > 80 ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'} transition-all duration-300 relative`}
                  style={{ width: `${floodLevel}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[ripple_1s_infinite]"></div>
                </div>
              </div>
            </div>
            
            <div className="text-center bg-gray-800 px-3 py-1 rounded border border-gray-700">
              <span className="block text-[10px] text-gray-500 font-mono">SYS. TIMER</span>
              <span className={`font-bold font-mono text-lg ${timeLeft <= 10 ? 'text-red-500 animate-bounce' : 'text-green-400'}`}>
                00:{timeLeft.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex bg-gray-900/80 border border-gray-700 rounded-lg py-2 px-6 shadow-xl backdrop-blur-md pointer-events-auto items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] font-mono">XP RATE</span>
            <span className="text-yellow-400 font-bold">{playerXp}</span>
          </div>
          <div className="w-px h-8 bg-gray-700"></div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-[10px] font-mono">FUNDS</span>
            <span className="text-green-400 font-bold">${playerCoins}</span>
          </div>
        </div>
      </div>

      <div className="z-10 w-full max-w-3xl px-4 mt-20 md:mt-0 flex flex-col items-center">
        {generating ? (
           <div className="h-[400px] flex flex-col items-center justify-center relative">
              <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)]"></div>
              <h3 className="font-mono text-blue-300 tracking-[0.2em] animate-pulse text-lg">ASSEMBLING NETWORK...</h3>
           </div>
        ) : (
          <div className={`bg-gray-900/60 p-6 md:p-8 rounded-2xl border border-gray-700 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl relative transition-all duration-700 ${successGlow ? 'shadow-[0_0_100px_rgba(59,130,246,0.5)] ring-4 ring-blue-500/30' : ''}`}>
            
            {/* Success Bloom Overlay */}
            {successGlow && (
              <div className="absolute inset-0 z-30 pointer-events-none rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(59,130,246,0.2),_transparent)] animate-[ping_2s_infinite]"></div>
              </div>
            )}
            <div 
              className="grid gap-1 md:gap-2 mx-auto relative"
              style={{
                gridTemplateColumns: `repeat(${grid[0]?.length || 5}, minmax(0, 1fr))`
              }}
            >
              {grid.map((row, y) => (
                row.map((piece, x) => (
                  <PuzzleTile 
                    key={piece.id} 
                    piece={piece} 
                    onClick={rotatePiece} 
                    isSolved={isSolved} 
                  />
                ))
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button 
                onClick={() => navigate('/city-map')}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-full font-bold text-gray-300 transition-all flex items-center gap-2"
              >
                <span>✕</span> ABORT REPAIR
              </button>
            </div>
          </div>
        )}
      </div>

      {rewardData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-gray-950/90 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
           <div className="bg-gray-900 border border-blue-500/50 rounded-2xl p-8 max-w-sm w-full mx-4 shadow-[0_0_100px_rgba(59,130,246,0.3)] text-center transform animate-[slideUp_0.5s_ease-out]">
              <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-blue-500/30">
                 <span className="text-4xl">💧</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-2 tracking-tight">SYSTEM RESTORED</h2>
              <p className="text-blue-400 font-mono text-sm mb-8">Water flow stabilized.</p>
              <div className="space-y-4 mb-8 text-left bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-sm">Experience</span>
                  <span className="text-yellow-400 font-bold font-mono">+{rewardData.xp} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-sm">Credits</span>
                  <span className="text-green-400 font-bold font-mono">+${rewardData.coins}</span>
                </div>
                <div className="flex justify-between items-center bg-blue-900/30 p-2 rounded -mx-2">
                  <span className="text-blue-300 font-bold uppercase text-sm">Flood Risk</span>
                  <span className="text-blue-400 font-bold font-mono">-{rewardData.floodReduction}%</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/city-map')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95"
              >
                DEPLOY NEXT REPAIR
              </button>
           </div>
        </div>
      )}

      {isFailed && !rewardData && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/90 backdrop-blur-sm animate-[fadeIn_0.5s_ease-out]">
           <div className="text-center transform animate-[slideUp_0.5s_ease-out]">
              <h2 className="text-6xl font-black text-red-500 mb-4 tracking-tighter drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">DISTRICT BREACHED</h2>
              <p className="text-red-300 font-mono text-xl animate-pulse">Evacuating personnel...</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default PuzzleInterface;
