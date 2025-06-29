import { writable } from 'svelte/store';

export interface Player {
	id: string;
	name: string;
	cards: number[];
}

export interface Turn {
	current: { player: Player };
	played: Player[];
	remaining: Player[];
}

export const players = writable<Player[]>([]);
export const host = writable<Player | null>(null);
export const gameId = writable<string>('');
export const player = writable<Player>({ id: '', name: '', cards: [] });
export const turn = writable<Turn>({
	current: {
		player: { id: '', name: '', cards: [] }
	},
	played: [],
	remaining: []
});
