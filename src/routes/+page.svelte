<script lang="ts">
	import { socket } from '$lib/socket';
	import { goto } from '$app/navigation';
	import { playerId, players, host as hostStore, gameId as gameIdStore } from '$lib/stores/game';
	import type { Player } from '$lib/stores/game';

	function createGame(event: Event) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const name = data.get('name')?.toString().trim();

		socket.emit('gameCreate', { playerInputData: { name } });
		socket.on('gameCreated', (data) => {
			players.set(data.players);
			hostStore.set(data.players.find((player: Player) => player.id === data.hostId));
			gameIdStore.set(data.id);
		});
		socket.on('playerId', (data) => {
			playerId.set(data);
		});
		goto('/lobby');
	}

	function joinGame(event: Event) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const gameId = data.get('gameId')?.toString().trim();
		const name = data.get('name')?.toString().trim();

		socket.emit('gameJoin', { gameId, playerInputData: { name } });
		socket.on('gameUpdate', (data) => {
			players.set(data.players);
			hostStore.set(data.players.find((player: Player) => player.id === data.hostId));
			gameIdStore.set(data.id);
		});
		socket.on('playerId', (data) => {
			playerId.set(data);
		});
		goto('/lobby');
	}
</script>

<div class="flex flex-col gap-2 text-center">
	<h1 class="mb-4">Le Tarot Mexicain</h1>
</div>

<div class="flex gap-4">
	<div class="flex flex-1 flex-col gap-2">
		<p>Create a Game</p>
		<form on:submit={createGame} class="mx-auto flex w-full max-w-lg flex-col items-center gap-4">
			<div class="flex w-full flex-col gap-2">
				<label for="name">Name :</label>
				<input
					type="text"
					name="name"
					id="name"
					placeholder="Enter your name"
					class="border"
					required
				/>
			</div>
			<button type="submit" class="cursor-pointer underline">Créer une partie</button>
		</form>
	</div>
	<div class="flex flex-1 flex-col gap-2">
		<p>Join a Game</p>
		<form on:submit={joinGame} class="mx-auto flex w-full max-w-lg flex-col items-center gap-4">
			<div class="flex w-full flex-col gap-2">
				<label for="gameId">Id :</label>
				<input
					type="text"
					name="gameId"
					id="gameId"
					placeholder="Enter an ID"
					class="border"
					required
				/>
			</div>
			<div class="flex w-full flex-col gap-2">
				<label for="name">Name :</label>
				<input
					type="text"
					name="name"
					id="name"
					placeholder="Enter your name"
					class="border"
					required
				/>
			</div>
			<button type="submit" class="cursor-pointer underline">Rejoindre la partie</button>
		</form>
	</div>
</div>
