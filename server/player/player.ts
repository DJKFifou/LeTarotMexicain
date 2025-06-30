import type { PlayerData } from '../contracts/player';

export class Player {
	protected id: string;
	protected name: string;
	cards: number[];
	points: number = 0;

	constructor(playerData: PlayerData) {
		this.id = crypto.randomUUID();
		this.name = playerData.name;
		this.cards = playerData.cards || [];
		this.points = playerData.points || 0;
	}

	get data() {
		return {
			id: this.id,
			name: this.name,
			cards: this.cards || [],
			points: this.points
		};
	}
}
