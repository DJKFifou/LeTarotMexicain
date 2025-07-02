import type { PlayerData } from '../contracts/player';

export class Player {
	protected id: string;
	protected name: string;
	cards: number[];
	currentTurnPoints: number = 0;
	finalPoints: number = 0;

	constructor(playerData: PlayerData) {
		this.id = crypto.randomUUID();
		this.name = playerData.name;
		this.cards = playerData.cards || [];
		this.currentTurnPoints = playerData.currentTurnPoints || 0;
		this.finalPoints = playerData.finalPoints || 0;
	}

	get data() {
		return {
			id: this.id,
			name: this.name,
			cards: this.cards || [],
			currentTurnPoints: this.currentTurnPoints,
			finalPoints: this.finalPoints
		};
	}
}
