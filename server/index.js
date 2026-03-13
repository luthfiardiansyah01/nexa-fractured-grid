const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all for dev
    methods: ["GET", "POST"]
  }
});

// Game State Management
const GameManager = require('./game/GameManager');
const gameManager = new GameManager(io);

// API Endpoints
app.get('/', (req, res) => {
  res.send('NEXA: Fractured Grid Server is running');
});

app.post('/login', (req, res) => {
  const { username } = req.body;
  // Simple mock login
  res.json({ success: true, userId: 'user_' + Date.now(), username });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  gameManager.handleConnection(socket);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
