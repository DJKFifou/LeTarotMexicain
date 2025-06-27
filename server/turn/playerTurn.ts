import type { PlayerTurnData } from '../contracts/turn.js';
import type { EntityClass } from '../contracts/entities.js';
import { Game } from '../game/game.js';
import { Player } from '../player/player.js';

export interface PlayerTurnArgs {
	game: Game;
	player: Player;
}

export class PlayerTurn implements EntityClass<PlayerTurnData> {
	protected game: Game;
	player: Player;

	constructor({ game, player }: PlayerTurnArgs) {
		this.game = game;
		this.player = player;
	}

	get data(): PlayerTurnData {
		return {
			player: this.player.data
		};
	}
}
