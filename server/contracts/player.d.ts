export type PlayerId = string;

export interface PlayerData {
	id: PlayerId;
	name: string;
	cards?: number[];
}

export interface PlayerInputData {
	name: string;
}
