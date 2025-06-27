import { writable } from 'svelte/store';

export interface Player {
	id: string;
	name: string;
}

export interface Turn {
	current: { player: Player };
	played: Player[];
	remaining: Player[];
}

export const players = writable<Player[]>([]);
export const host = writable<Player | null>(null);
export const gameId = writable<string>('');
export const playerId = writable<string>('');
export const turn = writable<Turn>({
	current: {
		player: { id: '', name: '' }
	},
	played: [],
	remaining: []
});
