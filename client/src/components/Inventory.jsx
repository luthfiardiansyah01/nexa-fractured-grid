import React from 'react';

const Inventory = ({ items, onClose }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50 pointer-events-auto">
      <div className="bg-gray-800 p-6 rounded-lg w-96 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Inventory</h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-400">Close</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {items.map((item, index) => (
            <div key={index} className="w-16 h-16 bg-gray-700 border border-gray-600 rounded flex items-center justify-center hover:bg-gray-600 cursor-pointer" title={item}>
              {/* Placeholder icons */}
              <span className="text-xs text-center">{item}</span>
            </div>
          ))}
          {/* Empty slots */}
          {[...Array(12 - items.length)].map((_, i) => (
            <div key={`empty-${i}`} className="w-16 h-16 bg-gray-900 border border-gray-700 rounded opacity-50"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
