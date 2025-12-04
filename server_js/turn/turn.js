import { PlayerTurn } from './playerTurn.js';

export class Turn {
	game;
	played;
	current;
	remaining;

	constructor(game) {
		this.game = game;

		this.played = [];
		this.current = null;

		this.remaining = game.getPlayersByTurnOrder().map((player) => player.data.id);

		this.nextPlayer();
	}

	endTurn() {
			if (this.isEndOfTrick()) {
				const winner = this.getTrickWinner();
				if (winner) {
					this.setNextTrickOrder(winner.data.id);
				}
			}
			this.nextPlayer();
		}
	
		isEndOfTrick() {
			return this.remaining.length === 0;
		}
	
		getTrickWinner() {
			if (typeof this.game.getTrickWinner === 'function') {
				return this.game.getTrickWinner();
			}
			return null;
		}
	
		setNextTrickOrder(winnerId) {
			const playerList = this.game.getPlayersByTurnOrder();
			const winnerIndex = playerList.findIndex((p) => p.data.id === winnerId);
			if (winnerIndex === -1) return;
			const reordered = [...playerList.slice(winnerIndex), ...playerList.slice(0, winnerIndex)];
			this.remaining = reordered.map((p) => p.data.id);
			this.played = [];
		}

	nextPlayer() {
		if (this.current) {
			this.played.push(this.current.data.player.id);
		}

		const newCurrentPlayer = this.getNextPlayer();
		if (!newCurrentPlayer) {
			this.game.nextTurn();
			return;
		}

		this.remaining = this.remaining.filter((id) => id !== newCurrentPlayer.data.id);

		this.current = new PlayerTurn({
			game: this.game,
			player: newCurrentPlayer
		});
	}

	getNextPlayer() {
		const nextPlayerId = this.remaining[0] ?? null;

		return this.game.getPlayerById(nextPlayerId);
	}

	get playerListFromCurrent() {
		const playerList = this.game.playerList;
		const indexOfCurrent = playerList.findIndex(
			(player) => player.data.id === this?.current?.player.data.id
		);

		return [...playerList.slice(indexOfCurrent), ...playerList.slice(0, indexOfCurrent)];
	}

	get data() {
		return {
			played: this.played,
			current: this?.current?.data,
			remaining: this.remaining
		};
	}
}
