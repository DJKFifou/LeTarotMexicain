<script lang="ts">
	import { socket } from '$lib/socket';
	import { goto } from '$app/navigation';
	import { player, players, host as hostStore, gameId as gameIdStore } from '$lib/stores/game';
	import type { Player } from '$lib/stores/game';

	function joinGame(event: Event) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const gameId = window.location.pathname.substring(1);
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

<div class="flex h-dvh items-center justify-center gap-4 p-4">
	<div
		class="flex w-fit flex-col items-center justify-center gap-2 rounded-xl bg-black p-14 text-white"
	>
		<h3 class="text-xl font-medium">Join a Game</h3>
		<form on:submit={joinGame} class="flex flex-col items-center gap-4">
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
			<button type="submit" class="cursor-pointer underline underline-offset-4"
				>Rejoindre la partie</button
			>
		</form>
	</div>
</div>
