import { Component, Input, OnInit } from '@angular/core';
import { Card, UserCard } from '@app/pages/cards/card';
import { Artist } from '@app/pages/artists/artist';

@Component({
    selector: 'mb-items-list',
	templateUrl: './items-list.component.html',
	styleUrls: ['./items-list.component.scss']
})

export class ItemsListComponent implements OnInit {

	@Input() items: any[];

    constructor() {}

    ngOnInit() {

	}
	
	isCard(item: any) {
		return item instanceof Card;
	}

	isSet(item: any) {
		return item instanceof Set;
	}

	isArtist(item: any) {
		return item instanceof Artist;
	}

	isUserCard(item: any) {
		return item instanceof UserCard;
	}
}