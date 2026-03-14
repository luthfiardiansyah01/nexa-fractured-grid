# NEXA: Fractured Grid

**A browser-based cooperative puzzle game where players work together to repair a city's fractured drainage infrastructure.**

---

## 🎮 Game Overview

**NEXA: Fractured Grid** is a 2D puzzle experience played in a web browser. Players assume the roles of city engineers tasked with fixing a crumbling water and drainage system. The goal is to navigate a grid-based city, identify broken infrastructure, and solve puzzles to restore the flow before the city floods.

The game emphasizes **cooperation**: players share the same space and must coordinate their actions in real-time to succeed.

---

## 🏗️ Architecture & Design

The project is built as a "split system," separating what the player sees from the logic running the game world.

### The Frontend (The Player's View)
This is the visual interface running on the player's computer.
*   **React (The Dashboard):** Handles the "wrapper" around the game. It manages the menus, login screens, inventory systems, and player HUD (Heads-Up Display). It ensures that when you click a button or open a map, the interface responds instantly.
*   **Phaser (The Engine):** Handles the game world itself. It draws the 2D tile-based city map, animates the characters, and simulates the physics of water flowing through pipes. It is responsible for making the project feel like a game rather than a website.

### The Backend (The Game Master)
This runs on a remote server and acts as the brain of the operation.
*   **Node.js & Express:** These tools serve the application, ensuring the game loads in the browser and handling the core logic of the simulation (e.g., calculating flood levels).
*   **Socket.IO (The Connection):** This acts as a high-speed communication line. Unlike a standard website that only talks to the server when you click a link, Socket.IO keeps an open line. This ensures that if one player fixes a pipe, the server instantly tells every other player's computer to show that pipe as fixed.

---

## 🛠️ Technical Stack

*   **Frontend:** React, Phaser 3, Tailwind CSS
*   **Backend:** Node.js, Express, Socket.IO
*   **Build Tools:** Vite (for fast development loading)

---

## ✨ Key Features

*   **Real-Time Multiplayer:** Seamless movement and interaction synchronization.
*   **Hybrid UI:** A robust React interface overlaying a Phaser game engine.
*   **Simulation Logic:** Server-side water flow and flood calculation.
*   **Modular Code:** Organized into Managers, Players, and District classes for easy expansion.