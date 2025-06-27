import { PlayerData, PlayerId } from './player.js';

export interface PlayerTurnData {
	player: PlayerData;
}

export interface TurnData {
	played: Array<PlayerId>;
	current: PlayerTurnData | undefined;
	remaining: Array<PlayerId>;
}
