import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../../card/card';

@Component({
	selector: 'mb-card-item-list',
	templateUrl: 'card-item-list.component.html',
	styleUrls: ['./card-item-list.component.scss']
})

export class CardItemListComponent implements OnInit {

	@Input() card: Card;

	constructor() { }

	ngOnInit() { }
}