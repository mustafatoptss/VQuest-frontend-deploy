import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://vquest-backend-api.onrender.com';

class SocketService {
  socket = null;

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, { autoConnect: true });
      console.log('Socket bağlandı');
    }
    return this.socket;
  }

  // Sadece oda bağlantısını kes (App.jsx dinleyicilerini koru)
  leaveRoom() {
    if (this.socket) {
      this.socket.emit('leaveRoom');
    }
  }

  // Tamamen bağlantıyı kes (uygulama kapanırken)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) this.socket.emit(event, data);
  }

  on(event, callback) {
    if (this.socket) this.socket.on(event, callback);
  }

  off(event) {
    if (this.socket) this.socket.off(event);
  }
}

const socketService = new SocketService();
export default socketService;
