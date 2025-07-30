import { Game } from './game.js';

export class GameRepository {
	games;

	constructor() {
		this.games = new Map();
	}

	createGame() {
		const newGame = new Game();

		this.games.set(newGame.data.id, newGame);

		return newGame;
	}

	getGameById(gameId) {
		return this.games.get(gameId) ?? null;
	}
}

export const gameRepository = new GameRepository();
