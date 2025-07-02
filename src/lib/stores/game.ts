import { writable } from 'svelte/store';

export interface Player {
	id: string;
	name: string;
	cards: (number | 'Excuse')[];
	turnPoints: number;
	finalPoints: number;
}

export type Action = 'askTrick' | 'playCard';

export interface Turn {
	current: { player: Player; action: Action };
	played: Player[];
	remaining: Player[];
}

export const players = writable<Player[]>([]);
export const host = writable<Player | null>(null);
export const gameId = writable<string>('');
export const player = writable<Player>({
	id: '',
	name: '',
	cards: [],
	turnPoints: 0,
	finalPoints: 0
});
export const turn = writable<Turn>({
	current: {
		player: { id: '', name: '', cards: [], turnPoints: 0, finalPoints: 0 },
		action: 'askTrick'
	},
	played: [],
	remaining: []
});
export const currentTurnGuesses = writable<{ playerId: string; guess: number }[]>([]);
export const currentTurnPlays = writable<{ card: number; playerId: string }[]>([]);
export const currentTurnPoints = writable<{ playerId: string; turnPoints: number }[]>([]);
export const finalWinner = writable<string | null>(null);
export const distributor = writable<Player | null>(null);
export const action = writable<Action>('askTrick');
