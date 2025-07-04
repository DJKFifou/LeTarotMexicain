export type PlayerId = string;

export interface PlayerData {
	id: PlayerId;
	name: string;
	cards?: (number | 'Excuse')[];
	currentTurnPoints?: number;
	finalPoints?: number;
}

export interface PlayerInputData {
	name: string;
}
