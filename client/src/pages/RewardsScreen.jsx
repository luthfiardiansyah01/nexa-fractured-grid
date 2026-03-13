import React from 'react';
import { useNavigate } from 'react-router-dom';

const RewardsScreen = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white text-center">
      <div className="animate-bounce text-6xl mb-4">🏆</div>
      <h1 className="text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
        Mission Complete!
      </h1>
      <p className="text-2xl text-gray-300 mb-8">Old Town Drainage System Stabilized</p>

      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl border border-gray-700 w-full max-w-md">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <span className="text-gray-400">XP Earned</span>
          <span className="text-green-400 font-bold text-xl">+450 XP</span>
        </div>
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2">
          <span className="text-gray-400">Coins Found</span>
          <span className="text-yellow-400 font-bold text-xl">+120 Coins</span>
        </div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-gray-400">Items Unlocked</span>
          <span className="text-blue-400 font-bold">Blueprint: Advanced Pump</span>
        </div>

        <button 
          onClick={() => navigate('/menu')}
          className="w-full px-6 py-3 bg-blue-600 rounded hover:bg-blue-500 font-bold transition text-lg shadow-lg shadow-blue-500/50"
        >
          Claim Rewards
        </button>
      </div>
    </div>
  );
};

export default RewardsScreen;
