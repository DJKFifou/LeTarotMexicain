import { PlayerData, PlayerId } from './player.js';

export type GameId = string;

export interface currentTurnPlays {
	card: number;
	playerId: PlayerId;
}

export interface GameData {
	id: GameId;
	hostId: PlayerId | null;
	players: Array<PlayerData>;
	turn?: TurnData;
	round: number;
	currentTurnPlays: Array<currentTurnPlays>;
	currentTurnWinner: PlayerId | null;
	finalWinner: PlayerId | null;
}
