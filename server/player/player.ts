import type { PlayerData } from '../contracts/player';

export class Player {
	protected id: string;
	protected name: string;
	cards: number[];

	constructor(playerData: PlayerData) {
		this.id = crypto.randomUUID();
		this.name = playerData.name;
		this.cards = playerData.cards || [];
	}

	get data() {
		return {
			id: this.id,
			name: this.name,
			cards: this.cards || []
		};
	}
}
