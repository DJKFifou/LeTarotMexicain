<script lang="ts">
	import { socket } from '$lib/socket';
	import { player, players, host as hostStore, gameId, turn } from '$lib/stores/game';
	import { goto } from '$app/navigation';
	import type { Player } from '$lib/stores/game';

	socket.on('disconnected', () => {
		goto('/');
	});

	socket.on('gameCreated', (data) => {
		players.set(data.players);
		hostStore.set(data.players.find((player: Player) => player.id === data.hostId));
		gameId.set(data.id);
	});

	socket.on('gameUpdate', (data) => {
		players.set(data.players);
		hostStore.set(data.players.find((player: Player) => player.id === data.hostId));
		gameId.set(data.id);
	});

	function startGame(gameId: string) {
		socket.emit('startGame', gameId);
	}

	socket.on('gameStarted', (data) => {
		players.set(data.players);
		turn.set(data.turn);
		goto('/game');
	});
</script>

<div class="flex h-dvh w-full items-center justify-center">
	<div class="flex flex-col items-center justify-center gap-2 rounded-xl bg-black p-14 text-white">
		<div class="flex gap-1">
			<p>Id :</p>
			<button onclick={() => navigator.clipboard.writeText($gameId)} class="cursor-pointer"
				>{$gameId}</button
			>
		</div>

		<p>Hôte : {$hostStore?.name}</p>

		<div class="flex flex-col gap-1">
			<p>Invités :</p>
			{#if $players.length < 2}
				<p>Aucun</p>
			{:else}
				<ul>
					{#each $players as player}
						{#if player.id !== $hostStore?.id}
							<li class="ml-4 list-disc">{player.name}</li>
						{/if}
					{/each}
				</ul>
			{/if}
		</div>

		{#if $players.length >= 5}
			<p>Salon plein !</p>
		{/if}

		{#if $player.id === $hostStore?.id}
			<button onclick={() => startGame($gameId)} class="cursor-pointer underline underline-offset-4"
				>Commencer la partie</button
			>
		{:else}
			<p>En attente de l'hôte...</p>
		{/if}
	</div>
</div>
