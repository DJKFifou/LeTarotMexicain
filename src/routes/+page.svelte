<script lang="ts">
	import { socket } from '$lib/socket';
	import { goto } from '$app/navigation';
	import { player, players, host as hostStore, gameId as gameIdStore } from '$lib/stores/game';
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
		socket.on('player', (data) => {
			player.set(data);
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
		socket.on('player', (data) => {
			player.set(data);
		});
		goto('/lobby');
	}
</script>

<div class="relative my-4 flex h-dvh flex-col justify-center gap-12 text-center">
	<h1 class="absolute top-4 left-1/2 -translate-x-1/2 text-3xl font-bold">Le Tarot Mexicain</h1>
	<div class="flex w-full justify-center">
		<div
			class="grid w-full max-w-6xl grid-cols-1 items-center justify-center gap-4 p-4 md:grid-cols-2"
		>
			<div
				class="flex h-full flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-black p-14 text-white"
			>
				<h3 class="text-xl font-medium">Create a Game</h3>
				<form on:submit={createGame} class="mx-auto flex w-full max-w-lg flex-col gap-4">
					<div class="flex w-full flex-col items-start gap-2">
						<label for="name" class="font-medium">Name :</label>
						<input
							type="text"
							name="name"
							id="name"
							placeholder="Enter your name"
							class="w-full rounded-sm border p-2"
							required
						/>
					</div>
					<button type="submit" class="cursor-pointer underline underline-offset-4"
						>Créer une partie</button
					>
				</form>
			</div>
			<div
				class="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-black p-14 text-white"
			>
				<h3 class="text-xl font-medium">Join a Game</h3>
				<form on:submit={joinGame} class="mx-auto flex w-full max-w-lg flex-col items-center gap-4">
					<div class="flex w-full flex-col items-start gap-2">
						<label for="gameId" class="font-medium">Id :</label>
						<input
							type="text"
							name="gameId"
							id="gameId"
							placeholder="Enter an ID"
							class="w-full rounded-sm border p-2"
							required
						/>
					</div>
					<div class="flex w-full flex-col items-start gap-2">
						<label for="name" class="font-medium">Name :</label>
						<input
							type="text"
							name="name"
							id="name"
							placeholder="Enter your name"
							class="w-full rounded-sm border p-2"
							required
						/>
					</div>
					<button type="submit" class="cursor-pointer underline underline-offset-4"
						>Rejoindre la partie</button
					>
				</form>
			</div>
		</div>
	</div>
</div>
