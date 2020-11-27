import { TrackerPlayer } from './player/player';

export class Tracker {
	storm: number = 0;
	players: TrackerPlayer[] = [];

    constructor(init?:Partial<Tracker>) {
		Object.assign(this, init);
	}

	reset() {
		this.storm = 0;
		this.players.forEach(player => {
			player.reset();
		});
	}
}