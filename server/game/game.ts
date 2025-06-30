import type { GameData, GameId, currentTurnPlays } from '../contracts/game.js';
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
	round: number = 0;
	currentTurnPlays: currentTurnPlays[] = [];
	currentTurnWinner: PlayerId | null = null;
	finalWinner: PlayerId | null = null;

	constructor() {
		this.id = uuid;
		this.players = [];
		this.hostId = null;
		this.turn = null;
		this.round = 0;
		this.currentTurnPlays = [];
		this.currentTurnWinner = null;
		this.finalWinner = null;
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

	addPointToPlayer(): void {
		if (this.currentTurnPlays.length) {
			const highestPlay = this.currentTurnPlays.reduce((prev, current) =>
				prev.card > current.card ? prev : current
			);
			console.log('Highest play:', highestPlay);
			const winningPlayer = this.getPlayerById(highestPlay.playerId);
			if (winningPlayer) {
				winningPlayer.points += 1;
			}
			console.log('Winning player:', winningPlayer?.data);
		}
	}

	checkRound(): void {
		const allPlayersHaveNoCards = this.players.every((player) => player.cards.length === 0);
		if (allPlayersHaveNoCards) {
			this.round += 1;

			if (this.round <= Math.floor(Cards.length / this.players.length - 1)) {
				this.distribueCards();
			} else {
				this.checkWinner();
			}
		}
	}

	checkWinner(): void {
		const winner = this.players.reduce((prev, current) =>
			prev.points > current.points ? prev : current
		);
		this.finalWinner = winner.data.name;
		console.log('Final winner:', this.finalWinner);
	}

	addCurrentTurnPlay(play: currentTurnPlays): void {
		this.currentTurnPlays.push(play);
	}

	clearCurrentTurnPlays(): void {
		this.currentTurnPlays = [];
	}

	distribueCards(): void {
		const shuffledCards = Cards.sort(() => Math.random() - 0.5);
		const remainingCards = shuffledCards.slice(this.round * this.players.length);
		const cardsPerPlayer = Math.floor(remainingCards.length / this.players.length);

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
			turn: this.turn?.data,
			round: this.round,
			currentTurnPlays: this.currentTurnPlays,
			currentTurnWinner: this.currentTurnWinner,
			finalWinner: this.finalWinner
		};
	}
}
