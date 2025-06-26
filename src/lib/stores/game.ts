import { writable } from 'svelte/store';

export interface Player {
	id: string;
	name: string;
}

export const players = writable<Player[]>([]);
export const host = writable<Player | null>(null);
export const gameId = writable<string>('');
export const playerId = writable<string>('');
