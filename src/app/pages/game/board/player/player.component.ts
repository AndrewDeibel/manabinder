import { Component, OnInit, Input } from '@angular/core';
import { Tag } from '@app/controls/tag';
import { GamePlayer } from '../../game';

@Component({
	selector: 'mb-player',
	templateUrl: 'player.component.html',
	styleUrls: ['./player.component.scss']
})

export class PlayerComponent implements OnInit {

	@Input() player: GamePlayer;

	playerTag: Tag = new Tag();

	constructor() { }

	ngOnInit() {
		this.playerTag.text = "Tag";
	}
}