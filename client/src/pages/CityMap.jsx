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

  const getStatus = () => {
    if (districtStatus.flooding || districtStatus.waterLevel > 80) return { text: 'Critical', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    if (districtStatus.waterLevel > 50) return { text: 'Warning', color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' };
    return { text: 'Stable', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' };
  };

  const status = getStatus();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gray-950 font-sans">
      <GameCanvas 
        username={username} 
        onDistrictUpdate={handleDistrictUpdate} 
        onPuzzleTrigger={handlePuzzleTrigger}
      />
      
      {/* HUD Layer - Global Overlay */}
      <div className="ui-overlay pointer-events-none fixed inset-0 z-50">
        
        {/* Right Sidebar HUD */}
        <aside className="absolute top-6 right-6 bottom-6 w-80 flex flex-col gap-4 pointer-events-auto">
          
          {/* 1. Header & Logo */}
          <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex items-center gap-4 shadow-2xl">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/20">N</div>
            <span className="font-black tracking-tighter text-xl text-white">NEXA <span className="text-blue-500 uppercase">Grid</span></span>
          </div>

          {/* 2. Player Stats */}
          <div className="space-y-2">
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
               <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px] font-black text-yellow-500 border border-yellow-500/30">XP</div>
               <div className="flex flex-col">
                 <span className="text-white font-bold text-sm tracking-wide">XP: 1,250</span>
               </div>
            </div>
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] font-black text-emerald-500 border border-emerald-500/30">$</div>
               <div className="flex flex-col">
                 <span className="text-white font-bold text-sm tracking-wide">Coin: 450</span>
               </div>
            </div>
          </div>

          {/* 3. Action Buttons */}
          <div className="space-y-2 pt-2">
            <button 
              className="w-full py-3 bg-red-500/20 hover:bg-red-500/30 text-rose-300 text-xs font-black uppercase tracking-[0.2em] rounded-2xl border border-red-500/30 transition-all active:scale-95 shadow-lg"
              onClick={handleReset}
            >
              Reset World
            </button>
            <button 
              className="w-full py-3 bg-gray-800/60 backdrop-blur-md hover:bg-gray-700/60 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl border border-white/10 transition-all active:scale-95 shadow-lg"
              onClick={toggleInventory}
            >
              Inventory
            </button>
            <button 
              className="w-full py-3 bg-gray-800/60 backdrop-blur-md hover:bg-gray-700/60 text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl border border-white/10 transition-all active:scale-95 shadow-lg"
              onClick={() => navigate('/menu')}
            >
              Menu
            </button>
          </div>

          {/* 4. Active Sector Panel (Bottom Aligned in Sidebar) */}
          <div className="mt-auto bg-gray-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-6 shadow-2xl flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Active Sector</span>
            </div>

            <div className="space-y-4">
              {/* City */}
              <div>
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1">City</span>
                <h1 className="text-lg font-black text-white/90 tracking-tight">{districtStatus.cityName || 'Aethelgard'}</h1>
              </div>

              {/* District */}
              <div className="relative">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest block mb-1">District</span>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white/80">
                    {(() => {
                      const districtSequence = ['OldTown', 'IndustrialZone'];
                      const index = districtSequence.indexOf(districtStatus.name) + 1;
                      const titleName = districtStatus.name.replace(/([A-Z])/g, ' $1').trim();
                      return index > 0 ? `District ${index}: ${titleName}` : titleName;
                    })()}
                  </h2>
                  <div className="text-white/20">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.52c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65z"/></svg>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Status</span>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.bg} ${status.border} ${status.color}`}>
                  {status.text}
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
              </div>

              {/* Water Level */}
              <div className="pt-2">
                <div className="flex justify-between items-end mb-3">
                   <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Water Level</span>
                   <span className={`text-xl font-black tabular-nums ${status.color}`}>
                      {Math.round(districtStatus.waterLevel)}%
                   </span>
                </div>
                <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5 shadow-inner relative">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${districtStatus.flooding || districtStatus.waterLevel > 80 ? 'bg-red-500 shadow-red-500/40' : 'bg-blue-500 shadow-blue-500/40'}`}
                    style={{ width: `${Math.min(districtStatus.waterLevel, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Bottom Left - Guide Button */}
        <div className="absolute bottom-10 left-10 flex items-center gap-4 pointer-events-auto">
           <button 
             onClick={toggleWalkthrough}
             className="w-14 h-14 rounded-full bg-blue-500/20 backdrop-blur-xl hover:bg-blue-600/30 text-blue-400 border-2 border-blue-500/40 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group"
           >
             <span className="text-2xl font-black group-hover:rotate-12 transition-transform">?</span>
           </button>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Guide</span>
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
