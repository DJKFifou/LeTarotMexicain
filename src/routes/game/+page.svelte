<script lang="ts">
	import { socket } from '$lib/socket';
	import { goto } from '$app/navigation';
	import {
		player as playerStore,
		players,
		host as hostStore,
		gameId,
		turn,
		currentTurnGuesses,
		currentTurnPlays,
		currentTurnPoints,
		finalWinner,
		action,
		round
	} from '$lib/stores/game';
	$: yourTurn = $turn.current.player.id === $playerStore.id;
	$: yourTurnToAsk = yourTurn && $action === 'askTrick';
	$: yourTurnToPlay = yourTurn && $action === 'playCard';
	$: {
		const currentPlayer = $players.find((p) => p.id === $playerStore.id);
		if (currentPlayer) {
			playerStore.set(currentPlayer);
		}
	}
	let showExcuseCardOptionValue = false;
	let showCard = false;
	interface Player {
		id: string;
		name: string;
		cards: number[];
		finalPoints: number;
		currentTurnPoints: number;
	}

	function playExcuseCard() {
		showExcuseCardOptionValue = true;
	}

	function playCard(gameId: string, playerCard: number) {
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

		if (!numberOfTrick || isNaN(Number(numberOfTrick))) {
			alert('Veuillez entrer un nombre valide de plis');
			return;
		}

		const sumOfTurnGuesses = $currentTurnGuesses.reduce(
			(acc, guess) => acc + Number(guess.guess),
			0
		);

		if (
			$turn.remaining.length < 1 &&
			sumOfTurnGuesses + Number(numberOfTrick) === $players[0].cards.length
		) {
			alert('Le nombre total de plis ne doit pas être égal au nombre de cartes');
			return;
		}

		socket.emit('askTrick', {
			gameId: $gameId,
			playerId: $playerStore.id,
			numberOfTrick: numberOfTrick
		});
	}

	socket.on('disconnected', () => {
		goto('/');
	});

	socket.on('currentTurnPoints', (data) => {
		currentTurnPoints.set(
			data.map((turnPoints: { playerId: string; turnPoints: number }) => ({
				playerId: turnPoints.playerId,
				turnPoints: turnPoints.turnPoints
			}))
		);
	});

	socket.on('finalWinner', (data) => {
		finalWinner.set(data);
	});

	socket.on('gameData', (data) => {
		players.set(data.players);
		turn.set(data.turn);
		currentTurnGuesses.set(data.currentTurnGuesses);
		currentTurnPlays.set(data.currentTurnPlays);
		currentTurnPoints.set(
			data.players.map((player: Player) => ({
				playerId: player.id,
				turnPoints: player.currentTurnPoints
			}))
		);
		action.set(data.action);
		round.set(data.round);
		finalWinner.set(data.finalWinner);
	});

	socket.on('cardsUpdate', (data) => {
		players.set(data.players);
		turn.set(data.turn);
		currentTurnPlays.set(data.currentTurnPlays);
		finalWinner.set(data.finalWinner);
		if (data.currentTurnPlays.length >= $players.length) {
			socket.emit('endTurn', data.id);
		}
	});

	socket.on('guessesUpdate', (data) => {
		currentTurnGuesses.set(data.currentTurnGuesses);
		turn.set(data.turn);
		if ($currentTurnGuesses.length >= $players.length) {
			socket.emit('endGuessPhase', data.id);
			if ($round === 4) {
				showCard = true;
				setTimeout(() => {
					showCard = false;
				}, 2500);
			}
		}
	});
</script>

<p>{$playerStore.name}</p>

<p>{$playerStore.id === $hostStore?.id ? "I'm the host" : "I'm not the host"}</p>

<p>{$turn.current.player.id === $playerStore.id ? "That's my turn !" : 'Not my turn yet...'}</p>

{#if $round !== 4}
	<div class="flex flex-wrap gap-2">
		{#each $playerStore.cards as playerCard}
			{#if yourTurnToPlay}
				{#if playerCard === 'Excuse'}
					<button on:click={() => playExcuseCard()} class="cursor-pointer rounded border p-2"
						>{playerCard}</button
					>
				{:else}
					<button
						on:click={() => playCard($gameId, playerCard)}
						class="cursor-pointer rounded border p-2">{playerCard}</button
					>
				{/if}
			{:else}
				<button class="rounded border p-2">{playerCard}</button>
			{/if}
		{/each}
	</div>
{/if}

{#if showExcuseCardOptionValue}
	<div
		class="absolute top-1/2 left-1/2 z-10 flex -translate-1/2 flex-col items-center gap-4 rounded-2xl border bg-gray-100 p-6"
	>
		<p>Choisir la valeur de l'Excuse :</p>
		<div class="flex gap-4">
			<button
				on:click={() => {
					showExcuseCardOptionValue = false;
					playCard($gameId, 0);
				}}
				class="cursor-pointer rounded border bg-white p-2">0</button
			>
			<button
				on:click={() => {
					showExcuseCardOptionValue = false;
					playCard($gameId, 22);
				}}
				class="cursor-pointer rounded border bg-white p-2">22</button
			>
		</div>
	</div>
{/if}

<div class="absolute top-1/2 left-1/2 flex -translate-1/2 flex-wrap gap-2">
	{#each $currentTurnPlays as play}
		<p>{play.card}</p>
	{/each}
</div>

{#if $finalWinner}
	<div class="absolute top-1/2 left-1/2 -translate-1/2">
		<p>Le gagnant est : {$finalWinner}</p>
		<p>Rappel des scores :</p>
		<div>
			{#each $players as player}
				<p>{player.finalPoints}</p>
			{/each}
		</div>
		<button
			on:click={() => {
				socket.emit('restartGame', $gameId);
				goto('/lobby');
			}}
			class="cursor-pointer bg-black p-1 text-white"
		>
			Rejouer
		</button>
		<button
			on:click={() => {
				socket.emit('leaveGame', $gameId);
				goto('/');
			}}
			class="cursor-pointer bg-black p-1 text-white"
		>
			Retour à l'accueil
		</button>
	</div>
{/if}

{#if yourTurnToAsk}
	<form on:submit={askedTrick}>
		<input
			type="number"
			min="0"
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
		<div class="flex flex-col items-center justify-end gap-2 text-center">
			{#if ($round === 4 && player.id !== $playerStore.id) || showCard}
				<p>Carte du joueur: {player.cards}</p>
			{/if}
			<div class="flex">
				<p>
					{$currentTurnPoints && $currentTurnGuesses
						? ($currentTurnPoints.find((turnPoints) => turnPoints.playerId === player.id)
								?.turnPoints ?? 0) + '/'
						: ''}
				</p>
				<p>
					{$currentTurnGuesses.find((guess) => guess.playerId === player.id)?.guess}
				</p>
			</div>
			<p>{player.finalPoints}</p>
			<p>{player.name}</p>
		</div>
	{/each}
</div>
