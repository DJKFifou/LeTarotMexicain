import { PlayerData, PlayerId } from './player.js';

export type GameId = string;

export interface GameData {
	id: GameId;
	hostId: PlayerId | null;
	players: Array<PlayerData>;
}
