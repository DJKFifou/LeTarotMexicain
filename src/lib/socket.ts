import { Socket, io } from 'socket.io-client';

type ClientSocket = Socket;
export const socket: ClientSocket = io('http://localhost:5173', {
	reconnection: true,
	reconnectionDelay: 1000
});
