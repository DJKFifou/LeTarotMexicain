import { io } from 'socket.io-client';

const socket = io('', {
	reconnection: true,
	reconnectionDelay: 1000
});

export { socket };
