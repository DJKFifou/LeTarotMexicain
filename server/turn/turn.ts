import type { EntityClass } from '../contracts/entities.js';
import type { PlayerId } from '../contracts/player.js';
import type { TurnData } from '../contracts/turn.js';
import { Game } from '../game/game.js';
import { Player } from '../player/player.js';
import { PlayerTurn } from './playerTurn.js';

export class Turn implements EntityClass<TurnData> {
	protected game: Game;

	protected played: Array<PlayerId>;
	current: PlayerTurn | null;
	protected remaining: Array<PlayerId>;

	constructor(game: Game) {
		this.game = game;

		this.played = [];
		this.current = null;
		this.remaining = game.data.players.map((player) => player.id);

		this.nextPlayer();
	}

	endTurn(): void {
		this.nextPlayer();
	}

	protected nextPlayer(): void {
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

	protected getNextPlayer(): Player | undefined {
		const nextPlayerId = this.remaining[0] ?? null;

		return this.game.getPlayerById(nextPlayerId);
	}

	get playerListFromCurrent(): Array<Player> {
		const playerList = this.game.playerList;
		const indexOfCurrent = playerList.findIndex(
			(player) => player.data.id === this?.current?.player.data.id
		);

		return [...playerList.slice(indexOfCurrent), ...playerList.slice(0, indexOfCurrent)];
	}

	get data(): TurnData {
		return {
			played: this.played,
			current: this?.current?.data,
			remaining: this.remaining
		};
	}
}
