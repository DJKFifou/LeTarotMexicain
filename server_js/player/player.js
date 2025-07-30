export class Player {
	id;
	name;
	cards;
	currentTurnPoints;
	finalPoints;

	constructor(playerData) {
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
