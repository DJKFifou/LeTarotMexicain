import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ params }) => {
	const gameId = params.id ?? '';
	return { gameId };
};
