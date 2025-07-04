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
					socket.emit('disconnected', {});
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
					console.log('gameUpdate : ', game.data);
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

				socket.on('askTrick', ({ gameId, playerId, numberOfTrick }) => {
					const game = gameRepository.getGameById(socket.data.gameId);

					if (!game) {
						console.error('Game not found:', gameId);
						return;
					}

					game.addCurrentTurnGuesses({ playerId, guess: numberOfTrick });

					game.turn?.endTurn();

					console.log('Guess trick :', game.data);

					io.to(gameId).emit('guessesUpdate', game.data);

					if (game.round >= 4) {
						socket.emit('playCard', {
							gameId: gameId,
							playerId: playerId,
							card: numberOfTrick
						});
					}
				});

				socket.on('endGuessPhase', (gameId) => {
					const game = gameRepository.getGameById(gameId);

					if (!game) {
						console.error('Game not found:', gameId);
						return;
					}

					game.playCard();

					io.to(gameId).emit('turnAction', game.data.action);
				});

				socket.on('playCard', ({ gameId, playerId, card }) => {
					const game = gameRepository.getGameById(socket.data.gameId);

					if (!game) {
						console.error('Game not found:', gameId);
						return;
					}

					const player = game.getPlayerById(playerId);

					game.addCurrentTurnPlay({ card, playerId });

					if (player) {
						if (card === 0 || card === 22) {
							player.cards = player.cards.filter((c) => c !== 'Excuse');
						} else {
							player.cards = player.cards.filter((c) => c !== card);
						}
					}

					game.turn?.endTurn();

					io.to(gameId).emit('cardsUpdate', game.data);
				});

				socket.on('endTurn', (gameId) => {
					const game = gameRepository.getGameById(gameId);

					if (!game) {
						console.error('Game not found:', gameId);
						return;
					}

					game.addCurrentTurnPointToPlayer();

					game.checkRound();

					game.clearCurrentTurnPlays();

					setTimeout(() => {
						io.to(gameId).emit('gameData', game.data);
					}, 1000);
				});

				socket.on('restartGame', (gameId) => {
					const game = gameRepository.getGameById(gameId);

					if (!game) {
						console.error('Game not found:', gameId);
						return;
					}

					game.restartGame();

					io.to(gameId).emit('gameData', game.data);
				});
			});
		}
	};
}
