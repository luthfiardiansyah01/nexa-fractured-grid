import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MultiplayerLobby = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([
    { id: 1, name: 'Alpha Squad', players: 2, status: 'Active' },
    { id: 2, name: 'Flood Defense Team', players: 1, status: 'Waiting' },
    { id: 3, name: 'Sewer Rats', players: 4, status: 'Full' },
  ]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-purple-400">Multiplayer Lobby</h1>
      
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Available Sessions</h2>
          <button className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500 font-bold">
            Create Session
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between bg-gray-700 p-4 rounded hover:bg-gray-600 transition">
              <div>
                <h3 className="font-bold text-lg">{session.name}</h3>
                <p className="text-sm text-gray-400">{session.players}/4 Players • {session.status}</p>
              </div>
              <button 
                onClick={() => navigate('/city-map')}
                disabled={session.status === 'Full'}
                className={`px-4 py-2 rounded font-bold ${session.status === 'Full' ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
              >
                {session.status === 'Full' ? 'Full' : 'Join'}
              </button>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={() => navigate('/menu')}
        className="mt-8 px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 font-bold transition"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default MultiplayerLobby;
