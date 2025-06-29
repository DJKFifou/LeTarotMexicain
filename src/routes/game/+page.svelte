<script lang="ts">
	import { socket } from '$lib/socket';
	import {
		player as playerStore,
		players,
		host as hostStore,
		gameId,
		turn
	} from '$lib/stores/game';
	$: yourTurn = $turn.current.player.id === $playerStore.id;
	$: {
		const currentPlayer = $players.find((p) => p.id === $playerStore.id);
		if (currentPlayer) {
			playerStore.set(currentPlayer);
		}
	}

	console.log('players:', $players);
	console.log('playerStore:', $playerStore);

	function playCard(gameId: string, playerCard: number) {
		console.log('Play card : ', playerCard);
		socket.emit('playCard', {
			gameId: gameId,
			playerId: $playerStore.id,
			card: playerCard
		});
	}

	socket.on('gameData', (data) => {
		console.log('📥 gameData received:', data);
		players.set(data.players);
		turn.set(data.turn);
	});
</script>

<p>Game :</p>

<p>{$playerStore.name}</p>

<p>{$playerStore.id === $hostStore?.id ? 'Im god' : 'Im a piece of shit'}</p>

<p>{$turn.current.player.id === $playerStore.id ? "That's my turn !" : 'Not my turn yet...'}</p>

<div class="flex flex-wrap gap-2">
	{#each $playerStore.cards as playerCard}
		{#if yourTurn}
			<button
				onclick={() => playCard($gameId, playerCard)}
				class="cursor-pointer rounded border p-2">{playerCard}</button
			>
		{:else}
			<button class="rounded border p-2">{playerCard}</button>
		{/if}
	{/each}
</div>
