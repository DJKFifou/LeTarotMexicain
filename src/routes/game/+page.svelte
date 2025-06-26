<script lang="ts">
	import { playerId, players, host as hostStore, gameId } from '$lib/stores/game';
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
