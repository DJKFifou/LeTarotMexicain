<script lang="ts">
	import { socket } from '$lib/socket';
	import {
		player as playerStore,
		players,
		host as hostStore,
		gameId,
		turn,
		currentTurnGuesses,
		currentTurnPlays,
		finalWinner,
		action,
		currentTurnPoints
	} from '$lib/stores/game';
	$: yourTurn = $turn.current.player.id === $playerStore.id;
	$: yourTurnToAsk = yourTurn && $turn.current.action === 'askTrick';
	$: yourTurnToPlay = yourTurn && $turn.current.action === 'playCard';
	$: {
		const currentPlayer = $players.find((p) => p.id === $playerStore.id);
		if (currentPlayer) {
			playerStore.set(currentPlayer);
		}
	}
	$: winner = $finalWinner;

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

	function askedTrick(event: Event) {
		event.preventDefault();

		const form = event.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const numberOfTrick = data.get('askTrick')?.toString().trim();

		console.log('Asked trick:', numberOfTrick);

		socket.emit('askTrick', {
			gameId: $gameId,
			playerId: $playerStore.id,
			numberOfTrick: numberOfTrick
		});
	}

	socket.on('gameData', (data) => {
		console.log('📥 gameData received:', data);
		players.set(data.players);
		turn.set(data.turn);
		currentTurnGuesses.set(data.currentTurnGuesses);
		currentTurnPlays.set(data.currentTurnPlays);
	});

	socket.on('cardsUpdate', (data) => {
		console.log('📥 cardsUpdate received:', data);
		players.set(data.players);
		turn.set(data.turn);
		currentTurnPlays.set(data.currentTurnPlays);
		if (data.currentTurnPlays.length >= $players.length) {
			console.log('Ending turn...');
			socket.emit('endTurn', data.id);
		}
		if (data.finalWinner) {
			finalWinner.set(data.finalWinner);
			console.log('Final winner:', data.finalWinner);
		}
	});

	socket.on('guessesUpdate', (data) => {
		console.log('📥 guessesUpdate received:', data);
		currentTurnGuesses.set(data.currentTurnGuesses);
		turn.set(data.turn);
		if ($currentTurnGuesses.length >= $players.length) {
			console.log('Ending guess phase...');
			socket.emit('endGuessPhase', data.id);
		}
	});

	socket.on('turnAction', (data) => {
		console.log('📥 turnAction received:', data);
		turn.set(data);
	});
</script>

<p>Game :</p>

<p>{$playerStore.name}</p>

<p>{$playerStore.id === $hostStore?.id ? 'Im god' : 'Im a piece of shit'}</p>

<p>{$turn.current.player.id === $playerStore.id ? "That's my turn !" : 'Not my turn yet...'}</p>

<div class="flex flex-wrap gap-2">
	{#each $playerStore.cards as playerCard}
		{#if yourTurnToPlay}
			<button
				on:click={() => playCard($gameId, playerCard)}
				class="cursor-pointer rounded border p-2">{playerCard}</button
			>
		{:else}
			<button class="rounded border p-2">{playerCard}</button>
		{/if}
	{/each}
</div>

<div class="absolute top-1/2 left-1/2 flex -translate-1/2 flex-wrap gap-2">
	{#each $currentTurnPlays as play}
		<p>{play.card}</p>
	{/each}
</div>

{#if winner}
	<div class="absolute top-1/2 left-1/2 -translate-1/2">
		<p>Le gagnant est : {$finalWinner}</p>
		<p>Rappel des scores :</p>
		<div>
			{#each $players as player}
				<p>{player.finalPoints}</p>
			{/each}
		</div>
	</div>
{/if}

{#if yourTurnToAsk}
	<form on:submit={askedTrick}>
		<input
			type="number"
			name="askTrick"
			id="askTrick"
			placeholder="Nombre de plis"
			class="border"
		/>
		<button type="submit" class="cursor-pointer bg-black p-1 text-white">Valider</button>
	</form>
{/if}

<div class="absolute bottom-0 left-1/2 flex -translate-x-1/2 gap-4">
	{#each $players as player}
		<div class="flex flex-col items-center gap-2 text-center">
			{#if $currentTurnGuesses.find((guess) => guess.playerId === player.id)}
				<p>
					{player.turnPoints}/{$currentTurnGuesses.find((guess) => guess.playerId === player.id)
						?.guess}
				</p>
			{/if}
			<p>{player.finalPoints}</p>
			<p>{player.name}</p>
		</div>
	{/each}
</div>
