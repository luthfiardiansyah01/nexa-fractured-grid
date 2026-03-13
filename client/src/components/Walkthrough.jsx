import React, { useState } from 'react';

const Walkthrough = ({ onClose }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: "Welcome to NEXA",
      content: "You are a drainage engineer. Your city is flooding, and the pipe network is fractured. Your mission is to repair the system.",
      highlight: "map"
    },
    {
      title: "Navigation",
      content: "Use ARROW KEYS to move your character around the city district.",
      highlight: "controls"
    },
    {
      title: "Identifying Problems",
      content: "Look for RED TILES. These are blocked or broken pipes causing water pressure buildup.",
      highlight: "red-tile"
    },
    {
      title: "Repairing Systems",
      content: "Click on a Red Tile to initiate a REPAIR SEQUENCE. This will open the Puzzle Interface.",
      highlight: "interaction"
    },
    {
      title: "Solving Puzzles",
      content: "Rotate the pipes to create a continuous flow from Start to End. Once solved, the system will stabilize.",
      highlight: "puzzle"
    },
    {
      title: "Monitoring Floods",
      content: "Keep an eye on the Water Level in the top-left HUD. If it reaches 100%, the district floods!",
      highlight: "hud"
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none w-full px-4">
      <div className="bg-gray-800/95 border-2 border-blue-500 rounded-lg max-w-lg w-full p-6 shadow-2xl relative pointer-events-auto backdrop-blur-md">
        {/* Progress Bar */}
        <div className="flex gap-1 mb-6">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-blue-500' : 'bg-gray-600'}`}
            ></div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-white mb-4">{steps[step].title}</h2>
        <p className="text-gray-300 text-lg mb-8 min-h-[80px]">{steps[step].content}</p>

        <div className="flex justify-between items-center">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm"
          >
            Skip Tutorial
          </button>
          
          <button 
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded flex items-center gap-2 transition"
          >
            {step === steps.length - 1 ? 'Start Mission' : 'Next'}
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Walkthrough;
