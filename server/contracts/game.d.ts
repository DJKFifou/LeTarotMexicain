import { PlayerData, PlayerId } from './player.js';

export type GameId = string;

export interface CurrentTurnPlay {
	card: number;
	playerId: PlayerId;
}

export interface CurrentTurnGuess {
	playerId: PlayerId;
	guess: number;
}

export type Action = 'askTrick' | 'playCard';

export interface GameData {
	id: GameId;
	hostId: PlayerId | null;
	dealerId: PlayerId | null;
	players: Array<PlayerData>;
	turn?: TurnData;
	round: number;
	currentTurnGuesses: Array<CurrentTurnGuess>;
	currentTurnPlays: Array<CurrentTurnPlay>;
	currentTurnWinner: PlayerId | null;
	finalWinner: PlayerId | null;
	action: Action;
}
