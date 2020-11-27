import { Component, Input, OnInit } from '@angular/core';
import { Card, UserCard } from '@app/pages/cards/card';
import { Deck } from '@app/pages/decks/deck';
import { Artist } from '@app/pages/artists/artist';
import { Set } from '@app/pages/sets/set/set';
import { Binder } from '@app/pages/binders/binder/binder';

@Component({
    selector: 'mb-items-grid',
	templateUrl: './items-grid.component.html',
	styleUrls: ['./items-grid.component.scss']
})

export class ItemsGridComponent implements OnInit {

	@Input() items: any[] = [];
	art: boolean = false; // REFACTOR ME

	constructor() {}

    ngOnInit() {
		
	}

	isUserCard(item) {
		return item instanceof UserCard;
	}

	isCard(item) {
		return item instanceof Card;
	}

	isDeck(item) {
		return item instanceof Deck;
	}

	isSet(item) {
		return item instanceof Set;
	}

	isArtist(item) {
		return item instanceof Artist;
	}

	isBinder(item) {
		return item instanceof Binder;
	}

}