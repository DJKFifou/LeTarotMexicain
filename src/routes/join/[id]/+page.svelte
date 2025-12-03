<script lang="ts">
	import { onMount } from 'svelte';
	import { socket } from '$lib/socket';
	import { goto } from '$app/navigation';
	import { player, players, host as hostStore, gameId as gameIdStore } from '$lib/stores/game';
	import type { Player } from '$lib/stores/game';
	import type { PageProps } from './$types';

	let gameStatus: 'loading' | 'found' | 'not-found' = $state('loading');
	let { data }: PageProps = $props();
	console.log('datas : ', data);

	onMount(() => {
		gameIdStore.set(data.gameId);
		checkGameExists(data.gameId);
		console.log('Checking game with ID:', data.gameId);
		console.log('Checking game with storeID:', $gameIdStore);
	});

	function checkGameExists(gameId: string) {
		socket.emit('checkGameExists', { gameId });

		socket.once('gameExists', (data) => {
			gameStatus = data.exists ? 'found' : 'not-found';
		});
	}

	function joinGame(event: Event) {
		console.log('Game joined');
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const name = data.get('name')?.toString().trim();

		console.log('Joining game with ID:', $gameIdStore);
		console.log('Player name:', name);

		socket.emit('gameJoin', { gameId: $gameIdStore, playerInputData: { name } });
	}

	socket.on('player', (data) => {
		player.set(data);
	});

	socket.on('gameUpdate', (data) => {
		console.log('Game updated:', data);
		players.set(data.players);
		hostStore.set(data.players.find((player: Player) => player.id === data.hostId));
		gameIdStore.set(data.id);
		goto('/lobby');
	});
</script>

<div class="flex h-dvh items-center justify-center gap-4 p-4">
	<div
		class="flex w-fit flex-col items-center justify-center gap-4 rounded-xl bg-black p-14 text-white"
	>
		{#if gameStatus === 'loading'}
			<p class="text-center font-medium">Vérification de l'ID...</p>
		{:else if gameStatus === 'not-found'}
			<p class="text-center font-medium">Aucune partie trouvée</p>
			<button
				onclick={() => goto('/')}
				class="cursor-pointer font-medium underline underline-offset-4"
			>
				Retour à l'accueil
			</button>
		{:else}
			<h3 class="text-xl font-medium">Join a Game</h3>
			<form onsubmit={joinGame} class="flex flex-col items-center gap-4">
				<div class="flex w-full flex-col items-start gap-2">
					<label for="name" class="font-medium">Name :</label>
					<input
						type="text"
						name="name"
						placeholder="Enter your name"
						class="w-full rounded-sm border p-2"
						required
					/>
				</div>
				<button type="submit" class="cursor-pointer underline underline-offset-4">
					Rejoindre la partie
				</button>
			</form>
		{/if}
	</div>
</div>
