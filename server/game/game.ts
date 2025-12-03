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
	protected dealerId: PlayerId | null;
	public players: Player[];
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
		this.dealerId = null;
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

		if (!this.dealerId) {
			this.dealerId = player.data.id;
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
			const pointsToAdd =
				guessValue === player.currentTurnPoints
					? 0
					: Math.abs(guessValue - player.currentTurnPoints);
			player.finalPoints += pointsToAdd;
			player.currentTurnPoints = 0;
		});
	}

	restartGame(): void {
		this.round = 0;
		this.currentTurnGuesses = [];
		this.currentTurnPlays = [];
		this.currentTurnWinner = null;
		this.finalWinner = null;
		this.players.forEach((player) => {
			player.cards = [];
			player.currentTurnPoints = 0;
			player.finalPoints = 0;
		});
		this.dealerId = this.hostId;
		this.turn = null;
		this.distribueCards();
		this.askTrick();
	}

	checkRound(): void {
		if (this.players.every((player) => player.cards.length === 0)) {
			this.round += 1;

			this.addFinalPointsToPlayers();
			this.clearCurrentTurnGuesses();

			if (this.round > 4) {
				this.round = 0;
				console.log('Round finished, rotating dealer...');
				console.log('Current dealer:', this.dealerId);
				this.rotateDealer();
				console.log('New dealer:', this.dealerId);
				if (this.dealerId === this.hostId) {
					this.checkWinner();
					return;
				}
			}

			this.distribueCards();
			this.askTrick();
		}
	}

	checkWinner(): void {
		const winner = this.players.reduce((prev, current) =>
			prev.finalPoints < current.finalPoints ? prev : current
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
		const shuffledCards = [...Cards];

		for (let i = shuffledCards.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
		}

		const maxCardsPerPlayer = Math.max(1, 4 - this.round);

		this.players.forEach((player, index) => {
			const start = index * maxCardsPerPlayer;
			const end = start + maxCardsPerPlayer;
			player.cards = shuffledCards.slice(start, end);
		});
	}

	start(): void {
		this.distribueCards();
		this.nextTurn();
		this.askTrick();
	}

	askTrick(): void {
		this.turn = new Turn(this);

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

	rotateDealer(): void {
		if (!this.dealerId || this.players.length === 0) {
			return;
		}

		const currentDealerIndex = this.players.findIndex((player) => player.data.id === this.dealerId);

		if (currentDealerIndex !== -1) {
			const nextDealerIndex = (currentDealerIndex + 1) % this.players.length;
			this.dealerId = this.players[nextDealerIndex].data.id;
		}
	}

	getPlayersByTurnOrder(): Player[] {
		if (!this.dealerId || this.players.length === 0) {
			return this.players;
		}

		const dealerIndex = this.players.findIndex((player) => player.data.id === this.dealerId);

		if (dealerIndex === -1) {
			return this.players;
		}

		return [...this.players.slice(dealerIndex), ...this.players.slice(0, dealerIndex)];
	}

	playRound4Automatically(): void {
		console.log('Playing round 4 automatically...');
		this.players.forEach((player) => {
			if (player.cards.length > 0) {
				const cardValue = player.cards[0];
				console.log('Player:', player.data.name, 'plays card:', cardValue);
				let numericCardValue: number;

				if (cardValue === 'Excuse') {
					console.log('Player:', player.data.name, 'plays Excuse');
					const playerGuess = this.currentTurnGuesses.find(
						(guess) => guess.playerId === player.data.id
					);
					console.log('Player guess:', playerGuess);
					const guessValue = Number(playerGuess?.guess ?? 0);
					console.log('guessValue:', guessValue);
					numericCardValue = guessValue === 0 ? 0 : 22;
				} else {
					numericCardValue = cardValue;
				}
				console.log('numericCardValue:', numericCardValue);

				this.addCurrentTurnPlay({ card: numericCardValue, playerId: player.data.id });
			}
		});

		this.addCurrentTurnPointToPlayer();
	}

	finishRound4(): void {
		this.players.forEach((player) => {
			player.cards = [];
		});

		this.checkRound();

		this.clearCurrentTurnPlays();

		this.action = 'askTrick';
	}

	get data(): GameData {
		return {
			id: this.id,
			hostId: this.hostId,
			dealerId: this.dealerId,
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

	getDataForPlayer(playerId: PlayerId): GameData {
		return {
			id: this.id,
			hostId: this.hostId,
			dealerId: this.dealerId,
			players: this.players.map((player) => {
				if (player.data.id === playerId) {
					return player.data;
				} else {
					return {
						...player.data,
						cards: new Array(player.cards.length).fill(null)
					};
				}
			}),
			turn: this.turn?.data,
			round: this.round,
			currentTurnGuesses: this.currentTurnGuesses,
			currentTurnPlays: this.currentTurnPlays,
			currentTurnWinner: this.currentTurnWinner,
			finalWinner: this.finalWinner,
			action: this.action
		};
	}

	getDataForPlayerRound4(playerId: PlayerId): GameData {
		return {
			id: this.id,
			hostId: this.hostId,
			dealerId: this.dealerId,
			players: this.players.map((player) => {
				if (player.data.id === playerId) {
					return {
						...player.data,
						cards: new Array(player.cards.length).fill(null)
					};
				} else {
					return player.data;
				}
			}),
			turn: this.turn?.data,
			round: this.round,
			currentTurnGuesses: this.currentTurnGuesses,
			currentTurnPlays: this.currentTurnPlays,
			currentTurnWinner: this.currentTurnWinner,
			finalWinner: this.finalWinner,
			action: this.action
		};
	}

	getSecureDataForPlayer(playerId: PlayerId): GameData {
		if (this.round === 4) {
			return this.getDataForPlayerRound4(playerId);
		} else {
			return this.getDataForPlayer(playerId);
		}
	}

	getTrickWinner(): Player | null {
		if (!this.currentTurnPlays || !this.currentTurnPlays.length) return null;
		const bestPlay = this.currentTurnPlays.reduce((prev, current) =>
			prev.card > current.card ? prev : current
		);
		return this.getPlayerById(bestPlay.playerId) ?? null;
	}
}
