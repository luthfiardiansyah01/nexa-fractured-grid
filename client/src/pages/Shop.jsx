import React from 'react';
import { useNavigate } from 'react-router-dom';

const Shop = () => {
  const navigate = useNavigate();
  const items = [
    { id: 1, name: 'Advanced Wrench', price: 500, desc: 'Repairs pipes 2x faster.' },
    { id: 2, name: 'Hydro-Scanner', price: 1200, desc: 'Reveals hidden blockages.' },
    { id: 3, name: 'Pressure Stabilizer', price: 800, desc: 'Auto-regulates flow spikes.' },
    { id: 4, name: 'Neon Visor', price: 2000, desc: 'Cosmetic: Look cool while draining.' },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8 text-yellow-400">Equipment Shop</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full px-4">
        {items.map((item) => (
          <div key={item.id} className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500 transition shadow-lg flex flex-col justify-between">
            <div>
              <div className="w-full h-32 bg-gray-700 rounded mb-4 flex items-center justify-center text-4xl">
                🔧
              </div>
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-yellow-400 font-bold text-xl">${item.price}</span>
              <button className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-500 font-bold text-black">
                Buy
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={() => navigate('/menu')}
        className="mt-12 px-6 py-2 bg-gray-700 rounded hover:bg-gray-600 font-bold transition"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default Shop;
