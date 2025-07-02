export type PlayerId = string;

export interface PlayerData {
	id: PlayerId;
	name: string;
	cards?: number[];
	currentTurnPoints?: number;
	finalPoints?: number;
}

export interface PlayerInputData {
	name: string;
}
