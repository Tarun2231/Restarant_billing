import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const joinAdminRoom = () => {
  if (socket) {
    socket.emit('join-admin');
  }
};

export const joinKitchenRoom = () => {
  if (socket) {
    socket.emit('join-kitchen');
  }
};

export const joinOrderRoom = (orderId) => {
  if (socket) {
    socket.emit('join-order', orderId);
  }
};

export const getSocket = () => socket;

const socketService = {
  connectSocket,
  disconnectSocket,
  joinAdminRoom,
  joinKitchenRoom,
  joinOrderRoom,
  getSocket,
};

export default socketService;

