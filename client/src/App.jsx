import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import MainMenu from './pages/MainMenu';
import CityMap from './pages/CityMap';
import PuzzleInterface from './pages/PuzzleInterface';
import MultiplayerLobby from './pages/MultiplayerLobby';
import Shop from './pages/Shop';
import RewardsScreen from './pages/RewardsScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/menu" element={<MainMenu />} />
        <Route path="/city-map" element={<CityMap />} />
        <Route path="/puzzle" element={<PuzzleInterface />} />
        <Route path="/lobby" element={<MultiplayerLobby />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/rewards" element={<RewardsScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
