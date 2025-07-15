import { Socket, io } from 'socket.io-client';

type ClientSocket = Socket;
export const socket: ClientSocket = io('http://192.168.1.27:5173', {
	reconnection: true,
	reconnectionDelay: 1000
});
