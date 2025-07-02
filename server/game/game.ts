import type {
	GameData,
	GameId,
	CurrentTurnPlay,
	CurrentTurnGuess,
	Action
} from '../contracts/game.js';
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
	currentTurnGuesses: CurrentTurnGuess[] = [];
	currentTurnPlays: CurrentTurnPlay[] = [];
	currentTurnWinner: PlayerId | null = null;
	finalWinner: PlayerId | null = null;
	action: Action = 'askTrick';

	constructor() {
		this.id = uuid;
		this.players = [];
		this.hostId = null;
		this.turn = null;
		this.round = 0;
		this.currentTurnGuesses = [];
		this.currentTurnPlays = [];
		this.currentTurnWinner = null;
		this.finalWinner = null;
		this.action = 'askTrick';
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

	addCurrentTurnPointToPlayer(): void {
		if (this.currentTurnPlays.length) {
			const highestPlay = this.currentTurnPlays.reduce((prev, current) =>
				prev.card > current.card ? prev : current
			);
			console.log('Highest play:', highestPlay);
			const winningPlayer = this.getPlayerById(highestPlay.playerId);
			if (winningPlayer) {
				winningPlayer.currentTurnPoints += 1;
			}
			console.log('Winning player:', winningPlayer?.data);
		}
	}

	addFinalPointsToPlayers(): void {
		this.players.forEach((player) => {
			const playerGuess = this.currentTurnGuesses.find(
				(guess) => guess.playerId === player.data.id
			);
			const guessValue = playerGuess?.guess ?? 0;
			player.finalPoints += Math.abs(guessValue - player.currentTurnPoints);
			player.currentTurnPoints = 0;
		});
	}

	checkRound(): void {
		const allPlayersHaveNoCards = this.players.every((player) => player.cards.length === 0);
		if (allPlayersHaveNoCards) {
			this.round += 1;
			this.addFinalPointsToPlayers();

			if (this.round <= Math.floor(Cards.length / this.players.length - 1)) {
				this.distribueCards();
				this.clearCurrentTurnGuesses();
				this.askTrick();
			} else {
				this.checkWinner();
			}
		}
	}

	checkWinner(): void {
		const winner = this.players.reduce((prev, current) =>
			prev.finalPoints > current.finalPoints ? prev : current
		);
		this.finalWinner = winner.data.name;
		console.log('Final winner:', this.finalWinner);
	}

	addCurrentTurnGuesses(guess: CurrentTurnGuess): void {
		this.currentTurnGuesses.push(guess);
	}

	clearCurrentTurnGuesses(): void {
		this.currentTurnGuesses = [];
	}

	addCurrentTurnPlay(play: CurrentTurnPlay): void {
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
		this.askTrick();
	}

	askTrick(): void {
		if (!this.turn) {
			this.turn = new Turn(this);
		}

		if (this.turn.current) {
			this.action = 'askTrick';
		}
	}

	playCard(): void {
		if (!this.turn) {
			this.turn = new Turn(this);
		}

		if (this.turn.current) {
			this.action = 'playCard';
		}
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
			currentTurnGuesses: this.currentTurnGuesses,
			currentTurnPlays: this.currentTurnPlays,
			currentTurnWinner: this.currentTurnWinner,
			finalWinner: this.finalWinner,
			action: this.action
		};
	}
}
