import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PuzzleGenerator } from '../game/puzzles/PuzzleGenerator';
import { socketService } from '../services/socket';

const PuzzleInterface = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { x, y } = location.state || {}; // Get coordinates from navigation state

  const [grid, setGrid] = useState([]);
  const [generating, setGenerating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Initializing Neural Link...");

  useEffect(() => {
    startGeneration();
  }, []);

  const startGeneration = () => {
    setGenerating(true);
    setProgress(0);
    setStatusText("Initializing Neural Link...");

    // Simulate AI Generation Process
    const steps = [
      { p: 20, t: "Scanning Topography..." },
      { p: 45, t: "Calculating Flow Dynamics..." },
      { p: 70, t: "Optimizing Pipe Network..." },
      { p: 90, t: "Finalizing Grid Structure..." },
      { p: 100, t: "Puzzle Generated." }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        
        // Use the actual Generator Class
        const puzzleData = PuzzleGenerator.generatePuzzle(5);
        // Map to UI format
        const uiGrid = puzzleData.grid.map((row, y) => 
          row.map((cell, x) => ({
            id: `${x}-${y}`,
            x, y,
            type: cell.type,
            rotation: cell.currentRotation,
            isLocked: cell.locked,
            isPath: cell.isPath
          }))
        );
        
        setGrid(uiGrid);
        setGenerating(false);
      } else {
        setProgress(steps[currentStep].p);
        setStatusText(steps[currentStep].t);
        currentStep++;
      }
    }, 400);
  };

  const rotatePiece = (x, y) => {
    if (generating) return;
    const newGrid = [...grid];
    const piece = newGrid[y][x];
    if (!piece.isLocked) {
      piece.rotation = (piece.rotation + 90) % 360;
      setGrid(newGrid);
    }
  };

  const getPipeColor = (type) => {
    if (type === 'straight') return 'bg-blue-500';
    if (type === 'corner') return 'bg-cyan-500';
    if (type === 't-shape') return 'bg-teal-500';
    return 'bg-purple-500'; // cross
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 pointer-events-none opacity-10">
        {[...Array(144)].map((_, i) => (
          <div key={i} className="border border-blue-500/20"></div>
        ))}
      </div>

      <div className="z-10 w-full max-w-2xl px-4">
        <div className="flex justify-between items-end mb-6 border-b border-blue-500/30 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              AI PUZZLE GENERATOR
            </h1>
            <p className="text-sm text-blue-400 font-mono mt-1">v2.4.1 // NEURAL_NET_ACTIVE</p>
          </div>
          <div className="text-right">
             <p className="text-xs text-gray-500 font-mono">ID: {Math.floor(Math.random() * 100000)}</p>
             <p className={`text-sm font-bold ${generating ? 'text-yellow-400 animate-pulse' : 'text-green-400'}`}>
               {generating ? 'PROCESSING' : 'READY'}
             </p>
          </div>
        </div>

        {generating ? (
          <div className="h-96 flex flex-col items-center justify-center bg-gray-800/50 rounded-lg border border-blue-500/30 backdrop-blur-sm relative">
            <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden mb-4">
              <div 
                className="h-full bg-blue-500 transition-all duration-300 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
              </div>
            </div>
            <p className="font-mono text-blue-300 animate-pulse">{statusText}</p>
            
            {/* Decoding Effect */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10">
              <pre className="text-xs text-green-500">
                {Array(10).fill(0).map((_, i) => (
                  <div key={i}>{Math.random().toString(2).substring(2, 30)}</div>
                ))}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/80 p-6 rounded-lg border border-blue-500/50 shadow-[0_0_30px_rgba(59,130,246,0.2)] backdrop-blur-md">
            <div className="grid grid-cols-5 gap-2 mb-6 mx-auto w-fit">
              {grid.map((row, y) => (
                row.map((piece, x) => (
                  <div 
                    key={piece.id}
                    onClick={() => rotatePiece(x, y)}
                    className={`w-14 h-14 md:w-16 md:h-16 bg-gray-700/80 rounded border ${piece.isLocked ? 'border-red-500/50 cursor-not-allowed' : 'border-blue-500/30 cursor-pointer hover:border-blue-400 hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]'} flex items-center justify-center transition-all duration-300 relative overflow-hidden group`}
                    style={{ transform: `rotate(${piece.rotation}deg)` }}
                  >
                    {/* Pipe Graphic */}
                    <div className={`absolute ${getPipeColor(piece.type)} opacity-80 shadow-inner`}
                      style={{
                        width: piece.type === 'straight' ? '30%' : piece.type === 'cross' ? '100%' : '30%',
                        height: piece.type === 'straight' ? '100%' : piece.type === 'cross' ? '30%' : '100%',
                        left: piece.type === 'corner' ? '35%' : piece.type === 'cross' ? '0' : '35%',
                        top: piece.type === 'cross' ? '35%' : '0'
                      }}
                    ></div>
                     {piece.type === 'cross' && (
                        <div className={`absolute ${getPipeColor(piece.type)} opacity-80 shadow-inner`}
                          style={{ width: '30%', height: '100%', left: '35%', top: '0' }}
                        ></div>
                     )}
                     {piece.type === 'corner' && (
                        <div className={`absolute ${getPipeColor(piece.type)} opacity-80 shadow-inner`}
                          style={{ width: '100%', height: '30%', left: '35%', top: '35%' }}
                        ></div>
                     )}
                     {piece.type === 't-shape' && (
                        <>
                         <div className={`absolute ${getPipeColor(piece.type)} opacity-80 shadow-inner`}
                            style={{ width: '30%', height: '100%', left: '35%', top: '0' }}
                         ></div>
                         <div className={`absolute ${getPipeColor(piece.type)} opacity-80 shadow-inner`}
                            style={{ width: '65%', height: '30%', left: '35%', top: '35%' }}
                         ></div>
                        </>
                     )}

                    {/* Locked Indicator */}
                    {piece.isLocked && (
                      <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
                    )}
                    
                    {/* Hover Glow */}
                    {!piece.isLocked && (
                      <div className="absolute inset-0 bg-blue-400/0 group-hover:bg-blue-400/10 transition-colors duration-300"></div>
                    )}
                  </div>
                ))
              ))}
            </div>
            
            <div className="flex justify-between items-center gap-4">
              <button 
                onClick={() => navigate('/city-map')}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded font-bold text-gray-300 transition flex items-center gap-2"
              >
                <span>&lt;</span> ABORT
              </button>
              
              <div className="flex gap-2">
                <button 
                    onClick={startGeneration}
                    className="px-6 py-2 bg-cyan-600/20 border border-cyan-500/50 hover:bg-cyan-600/40 rounded font-bold text-cyan-300 transition flex items-center gap-2 backdrop-blur-sm"
                >
                    <span className="animate-spin-slow">↻</span> REGENERATE
                </button>
                <button 
                    onClick={() => {
                        // In a real game, validate puzzle logic here
                        // For MVP, we trust the client action
                        if (x !== undefined && y !== undefined) {
                          socketService.emit('puzzleSolved', { x, y });
                          alert("System Stabilized. Sequence Verified.");
                          navigate('/city-map');
                        } else {
                          alert("Simulation Mode: Puzzle Solved (No server sync)");
                          navigate('/city-map');
                        }
                    }}
                    className="px-8 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition transform hover:scale-105"
                >
                    ACTIVATE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PuzzleInterface;
