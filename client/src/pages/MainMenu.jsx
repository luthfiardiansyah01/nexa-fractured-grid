import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainMenu = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Player';

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white relative">
      <div className="absolute inset-0 bg-[url('/assets/hero.png')] bg-cover opacity-20 pointer-events-none"></div>
      
      <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
        NEXA
      </h1>
      <p className="text-xl mb-8 text-gray-400">Welcome, Engineer {username}</p>

      <div className="grid grid-cols-1 gap-4 w-64 z-10">
        <button 
          onClick={() => navigate('/city-select')}
          className="px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 font-bold transition shadow-lg shadow-blue-500/50"
        >
          Enter City
        </button>
        <button 
          onClick={() => navigate('/lobby')}
          className="px-6 py-3 bg-purple-600 rounded hover:bg-purple-500 font-bold transition"
        >
          Multiplayer Lobby
        </button>
        <button 
          onClick={() => navigate('/shop')}
          className="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600 font-bold transition"
        >
          Shop
        </button>
        <button 
          onClick={() => navigate('/rewards')}
          className="px-6 py-3 bg-gray-700 rounded hover:bg-gray-600 font-bold transition"
        >
          Rewards
        </button>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-red-900/50 rounded hover:bg-red-800 font-bold transition mt-4"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default MainMenu;
