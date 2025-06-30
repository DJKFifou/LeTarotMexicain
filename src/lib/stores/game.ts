import { writable } from 'svelte/store';

export interface Player {
	id: string;
	name: string;
	cards: number[];
	points: number;
}

export interface Turn {
	current: { player: Player };
	played: Player[];
	remaining: Player[];
}

export const players = writable<Player[]>([]);
export const host = writable<Player | null>(null);
export const gameId = writable<string>('');
export const player = writable<Player>({ id: '', name: '', cards: [], points: 0 });
export const turn = writable<Turn>({
	current: {
		player: { id: '', name: '', cards: [], points: 0 }
	},
	played: [],
	remaining: []
});
export const currentTurnPlays = writable<{ card: number; playerId: string }[]>([]);
export const finalWinner = writable<string | null>(null);
export const distributor = writable<Player | null>(null);
