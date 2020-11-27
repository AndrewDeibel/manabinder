import { Component, OnInit } from '@angular/core';
import { Menu, MenuItem } from '@app/controls';
import { Icons } from '@app/models';
import { TrackerPlayer } from './player/player';
import { Tracker } from './tracker';

@Component({
	selector: 'mb-tracker',
	templateUrl: 'tracker.component.html',
	styleUrls: ['./tracker.component.scss']
})

export class TrackerComponent implements OnInit {

	tracker: Tracker;
	player: TrackerPlayer;
	menuTracker: Menu;

	constructor() {
		this.tracker = new Tracker({
			players: [
				new TrackerPlayer({
					lifeTotal: 40,
				})
			]
		});
		this.player = this.tracker.players[0];
	}

	ngOnInit() {
		let $this = this;
		this.menuTracker = new Menu({
			items: [
				new MenuItem({
					text: "Reset",
					icon: Icons.repeat,
					classesLink: "round-bottom-right",
					click: function () {
						if (confirm("Are you sure you want to reset?"))
							$this.tracker.reset();
					}
				})
			]
		})
	}

	increaseStorm() {
		this.tracker.storm++;
	}
	decreaseStorm() {
		if (this.tracker.storm > 0) this.tracker.storm--;
	}
}