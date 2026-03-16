import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3000"; // Should be env var in prod

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect() {
    if (this.socket && this.socket.connected) {
      return this.socket;
    }
    
    this.socket = io(SOCKET_URL);
    
    this.socket.on("connect", () => {
      console.log("Connected to server:", this.socket.id);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }
}

export const socketService = new SocketService();
