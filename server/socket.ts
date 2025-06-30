import type { Plugin } from 'vite';
import { Server } from 'socket.io';
import { gameRepository } from './game/game.repository.js';
import { Player } from './player/player.js';

export function socketIOPlugin(): Plugin {
	return {
		name: 'dev-socketio-server',
		configureServer(server) {
			const { httpServer } = server;
			if (!httpServer) return;

			const io = new Server(httpServer, {
				path: '/socket.io',
				cors: { origin: '*' },
				pingTimeout: 120000,
				pingInterval: 30000
			});

			io.on('connection', (socket) => {
				console.log('✅ Socket.IO client connected');

				socket.on('disconnect', (reason) => {
					console.log('Déconnecté :', reason);
				});

				socket.on('reconnect', (attemptNumber) => {
					console.log('Reconnecté après', attemptNumber, 'tentatives');
				});

				socket.on('gameCreate', ({ playerInputData }) => {
					console.log('create game');

					const createdGame = gameRepository.createGame();
					const createdGameId = createdGame.data.id;

					socket.join(createdGameId);

					const player = new Player(playerInputData);
					createdGame.addPlayer(player);

					createdGame.data.hostId = player.data.id;

					socket.data.gameId = createdGameId;
					socket.data.player = player.data;
					socket.data.hostId = player.data.id;

					socket.emit('player', player.data);
					socket.emit('gameCreated', createdGame.data);
				});

				socket.on('gameJoin', ({ gameId, playerInputData }) => {
					console.log('join game');
					console.log('gameId:', gameId);
					console.log('playerInputData:', playerInputData);
					const game = gameRepository.getGameById(gameId);

					if (
						!game ||
						!playerInputData.name?.trim() ||
						game.data.players.length >= 5 ||
						game.playerList.some((player) => player.data.name === playerInputData.name)
					) {
						return;
					}

					socket.join(gameId);

					const player = new Player(playerInputData);
					game.addPlayer(player);

					socket.data.gameId = game.data.id;
					socket.data.player = player.data;

					socket.emit('player', player.data);
					io.to(gameId).emit('gameUpdate', game.data);
					console.log('game.data : ', game.data);
				});

				socket.on('startGame', (gameId) => {
					console.log('start game', gameId);
					const game = gameRepository.getGameById(gameId);

					if (!game) {
						console.error('Game not found:', gameId);
						return;
					}

					game.start();

					io.to(gameId).emit('gameStarted', game.data);
				});

				socket.on('playCard', ({ gameId, playerId, card }) => {
					const game = gameRepository.getGameById(socket.data.gameId);

					const player = game?.getPlayerById(playerId);

					game?.addCurrentTurnPlay({ card, playerId });

					player.cards = player.cards.filter((c) => c !== card);

					game?.turn?.endTurn();

					io.to(gameId).emit('gameData', game?.data);
				});

				socket.on('endTurn', (gameId) => {
					const game = gameRepository.getGameById(gameId);

					game?.addPointToPlayer();

					game?.checkRound();

					game?.clearCurrentTurnPlays();

					setTimeout(() => {
						io.to(gameId).emit('gameData', game?.data);
					}, 1000);
				});
			});
		}
	};
}
