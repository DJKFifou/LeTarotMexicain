import { Server } from 'socket.io';
import { gameRepository } from './game/game.repository.js';
import { Player } from './player/player.js';

function sendFilteredDataToRoom(io, gameId, game, eventName) {
	const socketsInRoom = io.sockets.adapter.rooms.get(gameId);
	if (socketsInRoom) {
		for (const socketId of socketsInRoom) {
			const targetSocket = io.sockets.sockets.get(socketId);
			if (targetSocket && targetSocket.data.player) {
				targetSocket.emit(eventName, game.getSecureDataForPlayer(targetSocket.data.player.id));
			}
		}
	}
}

export function sockets(httpServer) {
	const io = new Server(httpServer);
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
			socket.emit('gameCreated', createdGame.getSecureDataForPlayer(player.data.id));
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

			sendFilteredDataToRoom(io, gameId, game, 'gameUpdate');
			console.log('gameUpdate sent to all players with filtered data');
		});

		socket.on('startGame', (gameId) => {
			console.log('start game', gameId);
			const game = gameRepository.getGameById(gameId);

			if (!game) {
				console.error('Game not found:', gameId);
				return;
			}

			game.start();

			sendFilteredDataToRoom(io, gameId, game, 'gameStarted');
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

			sendFilteredDataToRoom(io, gameId, game, 'guessesUpdate');

			if (game.round === 4 && game.currentTurnGuesses.length >= game.players.length) {
				game.playRound4Automatically();

				sendFilteredDataToRoom(io, gameId, game, 'gameData');

				setTimeout(() => {
					game.finishRound4();

					sendFilteredDataToRoom(io, gameId, game, 'gameData');
				}, 2000);
			}
		});

		socket.on('endGuessPhase', (gameId) => {
			const game = gameRepository.getGameById(gameId);

			if (!game) {
				console.error('Game not found:', gameId);
				return;
			}

			game.playCard();
			sendFilteredDataToRoom(io, gameId, game, 'gameData');
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

			sendFilteredDataToRoom(io, gameId, game, 'cardsUpdate');
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
				sendFilteredDataToRoom(io, gameId, game, 'gameData');
			}, 1500);
		});

		socket.on('restartGame', (gameId) => {
			const game = gameRepository.getGameById(gameId);

			if (!game) {
				console.error('Game not found:', gameId);
				return;
			}

			game.restartGame();

			sendFilteredDataToRoom(io, gameId, game, 'gameData');
		});
	});
	console.log('SocketIO injected');
	return io
}

export function socketIOPlugin() {
	return {
		name: 'dev-socketio-server',
		configureServer(server) {
			const { httpServer } = server;
			if (!httpServer) return;
			sockets(httpServer);
		}
	};
}
