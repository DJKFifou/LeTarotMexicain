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
		console.log('Starting game...');
		socket.emit('startGame', gameId);
	}

	socket.on('gameStarted', (data) => {
		console.log('data :', data);
		players.set(data.players);
		turn.set(data.turn);
		goto('/game');
	});
</script>

<p>Lobby :</p>

<p>ID : {$gameId}</p>

<p>Hôte : {$hostStore?.name}</p>

<div>
	<p>Invités :</p>
	<ul>
		{#each $players as player}
			{#if player.id !== $hostStore?.id}
				<li>{player.name}</li>
			{/if}
		{/each}
	</ul>
</div>

<!-- {#if $players.length >= 5}
	<p>Salon plein !</p>
{/if} -->

{#if $player.id === $hostStore?.id}
	<button onclick={() => startGame($gameId)} class="cursor-pointer underline">Start de game</button>
{/if}
