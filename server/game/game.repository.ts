import { Game } from './game.js';

export class GameRepository {
	private readonly games: Map<string, Game>;

	constructor() {
		this.games = new Map();
	}

	createGame(): Game {
		const newGame: Game = new Game();

		this.games.set(newGame.data.id, newGame);

		return newGame;
	}

	getGameById(gameId: string): Game | null {
		return this.games.get(gameId) ?? null;
	}
}

export const gameRepository = new GameRepository();
