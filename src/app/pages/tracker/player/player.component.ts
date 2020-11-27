import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Menu, MenuItem } from '@app/controls';
import { Icons } from '@app/models';
import { SymbolBlack, SymbolBlue, SymbolColorless, SymbolGreen, SymbolRed, SymbolWhite } from '@app/models/symbols';
import { TrackerPlayer } from './player';

@Component({
	selector: 'mb-tracker-player',
	templateUrl: 'player.component.html',
	styleUrls: ['./player.component.scss']
})

export class TrackerPlayerComponent implements OnInit {

	@Output() increaseStorm: EventEmitter<void> = new EventEmitter();
	@Output() decreaseStorm: EventEmitter<void> = new EventEmitter();
	@Input() player: TrackerPlayer;
	@Input() storm: number;
	menuCommanderDamage: Menu;
	symbolWhite: string = SymbolWhite;
	symbolBlue: string = SymbolBlue;
	symbolBlack: string = SymbolBlack;
	symbolRed: string = SymbolRed;
	symbolGreen: string = SymbolGreen;
	symbolColorless: string = SymbolColorless;
	showCommanderDamage: boolean = false;

	constructor() { }

	ngOnInit() {
		this.showCommanderDamage
		this.menuCommanderDamage = new Menu({
			clearActiveClickOutside: false,
			items: [
				new MenuItem({
					icon: Icons.swords,
					text: "Commander Damage",
					classesLink: "round-bottom-left",
					click: () => {
						this.toggleCommanderDamage();
					},
					menu: new Menu({

					})
				})
			]
		})
	}

	toggleCommanderDamage() {
		this.showCommanderDamage = !this.showCommanderDamage;
		this.menuCommanderDamage.items[0].active = this.showCommanderDamage;
	}

	_increaseStorm() {
		this.increaseStorm.next();
	}
	_decreaseStorm() {
		this.decreaseStorm.next();
	}
}