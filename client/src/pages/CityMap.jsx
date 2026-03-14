import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCanvas from '../components/GameCanvas';
import Inventory from '../components/Inventory';
import Walkthrough from '../components/Walkthrough';
import { socketService } from '../services/socket';

const CityMap = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Player';
  const initialDistrict = localStorage.getItem('current_district') || 'OldTown';
  const initialCityName = localStorage.getItem('current_city') || 'Cyber Tokyo';
  
  const [showInventory, setShowInventory] = useState(false);
  const [showWalkthrough, setShowWalkthrough] = useState(true); // Default to showing tutorial
  const [inventoryItems, setInventoryItems] = useState(['Wrench', 'Pipe', 'Scanner']);
  const [districtStatus, setDistrictStatus] = useState({ name: initialDistrict, cityName: initialCityName, waterLevel: 0, flooding: false });

  const handleDistrictUpdate = (data) => {
    setDistrictStatus(data);
  };

  const handlePuzzleTrigger = (data) => {
    // Navigate to puzzle with state
    navigate('/puzzle', { state: { x: data.x, y: data.y, grid: data.grid } });
  };

  const toggleInventory = () => setShowInventory(!showInventory);
  const toggleWalkthrough = () => setShowWalkthrough(!showWalkthrough);
  
  const handleReset = () => {
    if (confirm("Are you sure you want to RESET the entire game state? This affects all players.")) {
      socketService.emit('resetGame');
    }
  };

  return (
    <div className="relative w-full h-full">
      <GameCanvas 
        username={username} 
        onDistrictUpdate={handleDistrictUpdate} 
        onPuzzleTrigger={handlePuzzleTrigger}
      />
      
      {/* HUD Overlay */}
      <div className="ui-overlay pointer-events-none fixed inset-0">
        {/* Top Left: District Info */}
        <div className="absolute top-4 left-4 bg-gray-900/90 border border-gray-700 p-4 rounded text-white pointer-events-auto shadow-lg min-w-[240px]">
          <h2 className="text-xl font-bold text-blue-300">
            {(() => {
              const districtSequence = ['OldTown', 'IndustrialZone'];
              const index = districtSequence.indexOf(districtStatus.name) + 1;
              const titleName = districtStatus.name.replace(/([A-Z])/g, ' $1').trim();
              return index > 0 ? `District ${index}: ${titleName}` : `District: ${titleName}`;
            })()}
          </h2>
          <div className="mt-2 space-y-1">
            <p className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={districtStatus.flooding ? "text-red-500 font-bold animate-pulse" : "text-green-400"}>
                {districtStatus.flooding ? 'CRITICAL FLOOD' : 'Stable'}
              </span>
            </p>
            <div className="w-full bg-gray-700 h-3 rounded-full mt-2 overflow-hidden shadow-inner relative">
              <div 
                className={`h-full ${districtStatus.flooding ? 'bg-red-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'} transition-all duration-500`}
                style={{ width: `${Math.min(districtStatus.waterLevel, 100)}%` }}
              />
            </div>
            <p className="text-sm font-bold text-right pt-1">
              <span className={districtStatus.flooding ? "text-red-400" : "text-cyan-400"}>
                {Math.round(districtStatus.waterLevel)}%
              </span> 
              <span className="text-gray-400 text-xs ml-1 font-normal">Water Level</span>
            </p>
          </div>
        </div>

        {/* Top Right: Player Stats */}
        <div className="absolute top-4 right-4 bg-gray-900/90 border border-gray-700 p-2 px-4 rounded-full text-white pointer-events-auto flex items-center gap-4 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">XP</span>
            <span>1,250</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-bold">$</span>
            <span>450</span>
          </div>
        </div>

        {/* Bottom Right: Actions */}
        <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
          <button 
            className="p-3 bg-red-900/80 rounded-lg hover:bg-red-800 font-bold text-white shadow-lg border border-red-700 transition"
            onClick={handleReset}
            title="Reset Game World"
          >
            Reset
          </button>
          <button 
            className="p-3 bg-blue-600 rounded-lg hover:bg-blue-500 font-bold text-white shadow-lg border border-blue-400 transition transform hover:scale-105"
            onClick={toggleInventory}
          >
            Inventory
          </button>
          <button 
            className="p-3 bg-gray-700 rounded-lg hover:bg-gray-600 font-bold text-white shadow-lg border border-gray-500 transition"
            onClick={() => navigate('/menu')}
          >
            Menu
          </button>
        </div>
        
        {/* Help Button */}
        <div className="absolute bottom-4 left-4 pointer-events-auto">
           <button 
             onClick={toggleWalkthrough}
             className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-400 text-white font-bold flex items-center justify-center shadow-lg border-2 border-white/20"
           >
             ?
           </button>
        </div>
      </div>

      {showInventory && (
        <Inventory items={inventoryItems} onClose={toggleInventory} />
      )}

      {showWalkthrough && (
        <Walkthrough onClose={toggleWalkthrough} />
      )}
    </div>
  );
};

export default CityMap;
