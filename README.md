# NEXA: Fractured Grid

A browser-based 2D multiplayer puzzle game about repairing city drainage systems.

## Project Structure

- `client/`: React + Phaser frontend
    - `src/pages/`: React UI Screens (Login, Menu, Map, etc.)
    - `src/game/`: Phaser Game Logic
- `server/`: Node.js + Express + Socket.IO backend

## Setup

1.  **Install Dependencies**

    ```bash
    # Root
    cd server
    npm install
    
    cd ../client
    npm install
    ```

2.  **Run Development Server**

    You need to run both client and server.

    **Server:**
    ```bash
    cd server
    node index.js
    ```
    (Server runs on http://localhost:3000)

    **Client:**
    ```bash
    cd client
    npm run dev
    ```
    (Client runs on http://localhost:5173)

## Features

- **Multiplayer:** Real-time player movement using Socket.IO.
- **Game Engine:** Phaser 3 for 2D tile-based map.
- **UI:** React overlay for HUD and Inventory.
- **Simulation:** Basic water flow and flood simulation on the server.
- **Architecture:** Modular Game Manager, Player, and District classes.

## Tech Stack

- Frontend: React, Phaser, Tailwind CSS, Socket.IO Client
- Backend: Node.js, Express, Socket.IO, Firebase Admin (Mocked)
