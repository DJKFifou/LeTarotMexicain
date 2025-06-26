import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import type { Plugin } from 'vite';
import { Server } from 'socket.io';
import { gameRepository } from './server/game/game.repository';
import { Player } from './server/player/player.js';

function socketIOPlugin(): Plugin {
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
					socket.data.playerId = player.data.id;
					socket.data.hostId = player.data.id;

					socket.emit('playerId', player.data.id);
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
					socket.data.playerId = player.data.id;

					socket.emit('playerId', player.data.id);
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

					io.to(gameId).emit('gameStarted', game.data);
				});
			});
		}
	};
}

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), socketIOPlugin(), devtoolsJson()],
	test: {
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					environment: 'browser',
					browser: {
						enabled: true,
						provider: 'playwright',
						instances: [{ browser: 'chromium' }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
