import { Player } from '../player/player.js';
import type { GameData, GameId } from '../contracts/game.js';
import type { PlayerId } from '../contracts/player.js';
import type { Turn } from '../turn/turn.js';

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

	get data(): GameData {
		return {
			id: this.id,
			hostId: this.hostId,
			players: this.players.map((player) => player.data),
			turn: this.turn?.data
		};
	}
}
