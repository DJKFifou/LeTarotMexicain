export type PlayerId = string;

export interface PlayerData {
	id: PlayerId;
	name: string;
	cards?: number[];
	points?: number;
}

export interface PlayerInputData {
	name: string;
}
