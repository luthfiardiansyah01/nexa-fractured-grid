import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const CitySelection = () => {
  const navigate = useNavigate();
  const [unlockedLevel, setUnlockedLevel] = useState(1);

  // Define cities (mock data)
  const cities = [
    {
      id: 1,
      name: "Cyber Tokyo",
      district: "OldTown",
      image: "url('/assets/hero.png')",
      difficulty: "Tutorial",
      status: "unlocked"
    },
    {
      id: 2,
      name: "Neo York",
      district: "IndustrialZone",
      image: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1518398046578-8cca57782e17?auto=format&fit=crop&q=80&w=800')",
      difficulty: "Medium",
      status: "locked"
    },
    {
      id: 3,
      name: "Neo Jakarta",
      district: "UndergroundSector",
      image: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&q=80&w=800')",
      difficulty: "Hard",
      status: "locked"
    },
    {
      id: 4,
      name: "Neon London",
      district: "SkyCity",
      image: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&q=80&w=800')",
      difficulty: "Extreme",
      status: "locked"
    }
  ];

  useEffect(() => {
    // In a real app, this would fetch from backend/DB
    const savedProgress = localStorage.getItem('nexa_max_unlocked_city') || 1;
    setUnlockedLevel(parseInt(savedProgress));
  }, []);

  const handleCitySelect = (city) => {
    if (city.id <= unlockedLevel) {
      // Simulate selecting a city
      localStorage.setItem('current_city', city.name);
      localStorage.setItem('current_district', city.district);
      navigate('/city-map');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12 relative overflow-y-auto">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-[url('/assets/hero.png')] bg-cover opacity-5 pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              SELECT CITY
            </h1>
            <p className="text-gray-400 mt-2 font-mono">GLOBAL MONITORING NETWORK // AUTHORIZED ACCESS ONLY</p>
          </div>
          
          <button 
            onClick={() => navigate('/menu')}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded font-bold text-gray-300 transition flex items-center gap-2"
          >
            <span>&lt;</span> MAIN MENU
          </button>
        </div>

        {/* City Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cities.map((city) => {
            const isUnlocked = city.id <= unlockedLevel;
            
            return (
              <div 
                key={city.id}
                onClick={() => handleCitySelect(city)}
                className={`relative group rounded-xl overflow-hidden transition-all duration-500 h-80 flex flex-col justify-end
                  ${isUnlocked 
                    ? 'cursor-pointer hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-2 ring-1 ring-blue-500/30 hover:ring-blue-400' 
                    : 'cursor-not-allowed opacity-80 ring-1 ring-gray-700'}
                `}
                style={{
                  backgroundImage: city.image,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Dark Gradient Overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 sm:via-gray-900/80 to-transparent"></div>

                {/* Locked State Overlay */}
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                     <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="font-mono text-gray-400 font-bold tracking-widest text-sm">RESTRICTED</span>
                        <span className="text-xs text-gray-500 mt-1">Clear City {city.id - 1} to unlock</span>
                     </div>
                  </div>
                )}

                {/* Content */}
                <div className="relative z-20 p-6 w-full transform transition-transform duration-300">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-xs font-mono px-2 py-1 rounded 
                      ${city.difficulty === 'Tutorial' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                        city.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                        city.difficulty === 'Hard' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30':
                        'bg-red-500/20 text-red-400 border border-red-500/30'}
                    `}>
                      {city.difficulty}
                    </span>
                    <span className="text-gray-400 text-xs font-mono font-bold">{`#0${city.id}`}</span>
                  </div>
                  
                  <h3 className={`text-2xl font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                    {city.name}
                  </h3>
                  
                  <p className="text-sm text-gray-400 font-mono mb-4">
                    Target: {city.district}
                  </p>

                  {isUnlocked && (
                    <div className="mt-4 pt-4 border-t border-gray-700/50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-blue-400 font-bold text-sm">INITIATE DEPLOYMENT</span>
                      <span className="text-blue-400">→</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CitySelection;
