// import http from 'http';
// import { Server } from 'socket.io';
// import { handler } from '../build/handler.js';
// import { Player } from './player/player.js';
// import { gameRepository } from './game/game.repository.js';

// const server = http.createServer(handler);

// const io = new Server(server, {
// 	cors: {
// 		origin: '*'
// 	},
// 	path: '/socket.io'
// });

// io.on('connection', (socket) => {
// 	console.log('✅ Client connected');

// 	socket.on('gameCreate', ({ playerInputData }) => {
// 		console.log('create game');

// 		const createdGame = gameRepository.createGame();
// 		const createdGameId = createdGame.data.id;

// 		socket.join(createdGameId);

// 		const player = new Player(playerInputData);
// 		createdGame.addPlayer(player);

// 		createdGame.data.hostId = player.data.id;

// 		socket.data.gameId = createdGameId;
// 		socket.data.playerId = player.data.id;
// 		socket.data.hostId = player.data.id;

// 		socket.emit('playerId', player.data.id);
// 		socket.emit('hostId', player.data.id);
// 	});
// });

// server.listen(3000, () => {
// 	console.log('🚀 Server running on http://localhost:3000');
// });
