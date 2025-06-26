import { Player } from '../player/player.js';
import type { GameData, GameId } from '../contracts/game.js';
import type { PlayerId } from '../contracts/player.js';

const uuid = crypto.randomUUID();

export class Game {
	protected id: GameId;
	protected hostId: PlayerId | null;
	protected players: Player[];

	constructor() {
		this.id = uuid;
		this.players = [];
		this.hostId = null;
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

	get data(): GameData {
		return {
			id: this.id,
			hostId: this.hostId,
			players: this.players.map((player) => player.data)
		};
	}
}
