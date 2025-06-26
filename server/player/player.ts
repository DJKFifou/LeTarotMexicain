import type { PlayerData } from '../contracts/player';

export class Player {
	protected id: string;
	protected name: string;

	constructor(playerData: PlayerData) {
		this.id = crypto.randomUUID();
		this.name = playerData.name;
	}

	get data() {
		return {
			id: this.id,
			name: this.name
		};
	}
}
