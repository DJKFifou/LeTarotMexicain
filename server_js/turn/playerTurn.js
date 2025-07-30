export class PlayerTurn {
	game;
	player;

	constructor({ game, player }) {
		this.game = game;
		this.player = player;
	}

	get data() {
		return {
			player: this.player.data
		};
	}
}
