import { Component, OnInit, ViewEncapsulation, Input } from '@angular/core';

@Component({
	selector: 'mb-mana-cost',
	templateUrl: './mana-cost.component.html',
	styleUrls: ['./mana-cost.component.scss'],
})

export class ManaCostComponent implements OnInit {

	@Input() manaCost: string;

	constructor() { }

	ngOnInit(): void {
		
	}

}