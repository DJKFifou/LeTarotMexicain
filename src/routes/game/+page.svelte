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
	// let showCard = false;
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
			// if ($round === 4) {
			// 	showCard = true;
			// 	setTimeout(() => {
			// 		showCard = false;
			// 	}, 3000);
			// }
		}
	});
</script>

<div class="flex items-center justify-between bg-black p-4 font-medium text-white">
	<p>Nom : {$playerStore.name}</p>
	<h4 class="text-lg">
		{$turn.current.player.id === $playerStore.id ? 'À moi de jouer !' : 'En attente des joueurs...'}
	</h4>
	<p>Hôte : {$hostStore?.name}</p>
</div>

{#if $round !== 4}
	<div class="mt-4 flex flex-wrap justify-center gap-2">
		{#each $playerStore.cards as playerCard}
			{#if yourTurnToPlay}
				{#if playerCard === 'Excuse'}
					<button
						onclick={() => playExcuseCard()}
						class="h-20 w-15 cursor-pointer rounded border text-lg font-medium"
					>
						<span class="inline-block rotate-90">{playerCard}</span></button
					>
				{:else}
					<button
						onclick={() => playCard($gameId, playerCard)}
						class="h-20 w-15 cursor-pointer rounded border text-xl font-medium"
					>
						<span>{playerCard}</span></button
					>
				{/if}
			{:else if playerCard === 'Excuse'}
				<button class="h-20 w-15 rounded border text-lg font-medium">
					<span class="inline-block rotate-90">{playerCard}</span></button
				>
			{:else}
				<button class="h-20 w-15 rounded border text-xl font-medium">
					<span>{playerCard}</span></button
				>
			{/if}
		{/each}
	</div>
{/if}

{#if yourTurnToAsk}
	<form onsubmit={askedTrick} class="mt-4 flex justify-center">
		<input
			type="number"
			min="0"
			name="askTrick"
			id="askTrick"
			placeholder="Nombre de plis"
			class="rounded-s border px-2 py-1"
		/>
		<button type="submit" class="cursor-pointer rounded-e bg-black px-2 py-1 text-white"
			>Valider</button
		>
	</form>
{/if}

{#if showExcuseCardOptionValue}
	<div
		class="absolute top-1/2 left-1/2 z-10 flex -translate-1/2 flex-col items-center gap-4 rounded-2xl border bg-gray-100 p-6"
	>
		<p>Choisir la valeur de l'Excuse :</p>
		<div class="flex gap-4">
			<button
				onclick={() => {
					showExcuseCardOptionValue = false;
					playCard($gameId, 0);
				}}
				class="cursor-pointer rounded border bg-white p-2">0</button
			>
			<button
				onclick={() => {
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
		<button class="h-20 w-15 rounded border text-xl font-medium">{play.card}</button>
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
		{#if $playerStore.id === $hostStore?.id}
			<button
				onclick={() => {
					socket.emit('restartGame', $gameId);
					goto('/lobby');
				}}
				class="cursor-pointer bg-black p-1 text-white"
			>
				Rejouer
			</button>
		{:else}
			<p>En attente de l'hôte pour rejouer...</p>
		{/if}
		<button
			onclick={() => {
				socket.emit('leaveGame', $gameId);
				goto('/');
			}}
			class="cursor-pointer bg-black p-1 text-white"
		>
			Retour à l'accueil
		</button>
	</div>
{/if}

<div class="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-end justify-center gap-4">
	{#each $players as player}
		<div
			class="flex w-40 flex-col items-center justify-end gap-2 {player.id ===
			$turn.current.player.id
				? 'border-2'
				: 'border'} text-center"
		>
			<div class="w-full {player.id === $turn.current.player.id ? 'border-b-2' : 'border-b'} p-2">
				<p>{player.name}</p>
			</div>
			<div class="flex w-full flex-col items-start justify-center p-2">
				<div class="flex">
					{#if $round === 4 && player.id !== $playerStore.id}
						<p>Carte du joueur: {player.cards}</p>
					{/if}
				</div>
				<p>
					Plis annoncés:
					{$currentTurnGuesses.find((guess) => guess.playerId === player.id)?.guess}
				</p>
				<p>
					Plis remportés:
					{$currentTurnPoints && $currentTurnGuesses
						? ($currentTurnPoints.find((turnPoints) => turnPoints.playerId === player.id)
								?.turnPoints ?? '')
						: ''}
				</p>
				<p>Score: {player.finalPoints}</p>
			</div>
		</div>
	{/each}
</div>
