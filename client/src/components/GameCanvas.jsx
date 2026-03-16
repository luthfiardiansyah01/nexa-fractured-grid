import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import gameConfig from '../game/gameConfig';
import { socketService } from '../services/socket';

const GameCanvas = ({ username, onDistrictUpdate, onPuzzleTrigger }) => {
  const gameRef = useRef(null);
  const initialDistrict = localStorage.getItem('current_district') || 'OldTown';
  const initialCityName = localStorage.getItem('current_city') || 'Cyber Tokyo';

  useEffect(() => {
    if (gameRef.current) return; // Prevent double init

    // Connect socket
    const socket = socketService.connect();
    
    // Listen for updates here or inside Phaser scene
    // If inside React, we can update UI state
    socket.on('districtStatus', (data) => {
      if (onDistrictUpdate) onDistrictUpdate(data);
    });

    // Initialize Phaser
    const game = new Phaser.Game(gameConfig);
    game.registry.set('username', username);
    game.registry.set('currentDistrict', initialDistrict); // Pass initial district context
    game.registry.set('onPuzzleTrigger', onPuzzleTrigger);
    gameRef.current = game;

    return () => {
      // Cleanup
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [username]);

  return <div id="game-container" className="w-screen h-screen" />;
};

export default GameCanvas;
