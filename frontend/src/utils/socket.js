import { io } from 'socket.io-client';
import { SOCKET_ORIGIN } from '../config/api';

const SOCKET_URL = SOCKET_ORIGIN;

console.log('SOCKET_URL', SOCKET_URL);

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
});

export default socket;
