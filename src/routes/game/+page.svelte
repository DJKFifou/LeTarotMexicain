<script lang="ts">
	import { socket } from '$lib/socket';
	import { playerId, players, host as hostStore, gameId, turn } from '$lib/stores/game';
	$: yourTurn = $turn.current.player.id === $playerId;
	function endTurn(gameId: string) {
		console.log('Ending turn...');
		socket.emit('turnEnd', gameId);
	}

	socket.on('gameData', (data) => {
		console.log('📥 gameData received:', data);
		turn.set(data.turn);
		console.log('✅ Nouveau joueur courant :', data.turn.current.player.id);
		console.log('Joueur courant :', $turn.current.player.id);
		console.log('playerId :', $playerId);
	});
</script>

<p>Game :</p>

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

<p>{$playerId === $hostStore?.id ? 'Im god' : 'Im a piece of shit'}</p>

<p>{$turn.current.player.id === $playerId ? "That's my turn !" : 'Not my turn yet...'}</p>

{#if yourTurn}
	<button onclick={() => endTurn($gameId)}>Terminer le tour</button>
{/if}
