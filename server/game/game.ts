import type { GameData, GameId } from '../contracts/game.js';
import type { PlayerId } from '../contracts/player.js';
import { Player } from '../player/player.js';
import { Turn } from '../turn/turn.js';
import { Cards } from '../constants/cards.js';

const uuid = crypto.randomUUID();

export class Game {
	protected id: GameId;
	protected hostId: PlayerId | null;
	protected players: Player[];
	turn?: Turn | null;

	constructor() {
		this.id = uuid;
		this.players = [];
		this.hostId = null;
		this.turn = null;
	}

	addPlayer(player: Player): void {
		this.players.push(player);

		if (!this.hostId) {
			this.hostId = player.data.id;
		}
	}

	getPlayerById(id: PlayerId) {
		return this.players.find((player) => player.data.id === id);
	}

	get playerList(): Player[] {
		return this.players;
	}

	distribueCards(): void {
		const shuffledCards = Cards.sort(() => Math.random() - 0.5);
		const cardsPerPlayer = Math.floor(shuffledCards.length / this.players.length);
		const remainingCards = shuffledCards.slice(cardsPerPlayer * this.players.length);

		this.players.forEach((player, index) => {
			player.cards = shuffledCards.slice(index * cardsPerPlayer, (index + 1) * cardsPerPlayer);
		});
	}

	start(): void {
		this.distribueCards();
		this.nextTurn();
	}

	nextTurn(): void {
		this.turn = new Turn(this);
	}

	get data(): GameData {
		return {
			id: this.id,
			hostId: this.hostId,
			players: this.players.map((player) => player.data),
			turn: this.turn?.data
		};
	}
}
