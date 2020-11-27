import { Component, OnInit } from '@angular/core';
import { CollectionBindersService } from '@app/pages/collection/collection-binders/collection-binders.service';
import { CollectionCardsService } from '@app/pages/collection/collection-cards/collection-cards.service';
import { Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { BindersService } from '../binders.service';
import { Cards, UserCard } from '@app/pages/cards';
import { Binder } from './binder';
import { Menu, MenuItem } from '@app/controls/menu/menu';
import { AddCards } from '@app/controls/add-cards/add-cards';
import { Icons } from '@app/models/icons';
import { LoaderService } from '@app/controls';

@Component({
	selector: 'mb-binder',
	templateUrl: './binder.component.html',
	styleUrls: ['./binder.component.scss']
})

export class BinderComponent implements OnInit {

	cards: Cards;
	originalCards: UserCard[] = [];
	id: number;
	binder: Binder;
	addCards: AddCards;
	menu: Menu;

	constructor(
		private collectionBindersService: CollectionBindersService,
		private collectionCardsService: CollectionCardsService,
		private titleService: Title,
		private loaderService: LoaderService,
		private datePipe: DatePipe,
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService,
		private bindersService: BindersService
	) { }

	ngOnInit() {

		this.buildControls();

		// Response get binder
		this.bindersService.getBinderObservable().subscribe(binder => {
			if (binder) {
				this.responseBinder(binder);
			}
		});

		// Response remove binder card
		this.bindersService.removeBinderCardObservable().subscribe(binder => {
			if (binder) {
				this.responseBinder(binder);
			}
		});

		// ID param
		this.route.params.subscribe(params => {
			this.id = +params["id"];
			
			// Request binder
			this.getBinder();
		});
	}

	getBinder() {
		this.loaderService.show();
		this.bindersService.getBinder(this.id);
	}

	responseBinder(binder: Binder) {
		this.loaderService.hide();
		this.binder = binder;
		this.cards.items.header.title = binder.name;
		this.titleService.setTitle(`Mana Binder: Binder - ${binder.name}`);
		this.cards.items.header.subtitle = `cards: ${binder.cards.length} - created: ${this.datePipe.transform(binder.created_at)}`;
		//this.cards.items.header.price = binder
		//this.cards.items.header.tags.push()
		let cards: UserCard[] = [];
		binder.cards.forEach(card => {
			cards.push(new UserCard(card));
		});
		this.cards.items.items = cards;
		this.originalCards = cards;
	}

	buildControls() {
		this.buildAddCards();
		this.buildCards();
	}

	buildAddCards() {
		this.addCards = new AddCards();
	}

	buildCards() {
		this.cards = new Cards();
		this.cards.items.header.icon = Icons.deck;
		this.cards.items.showHeader = false;
		this.cards.items.showFooter = false;
		this.cards.items.filter.textboxSearch.placeholder = "Search cards in binder...";
		this.cards.items.noResults = "No cards found in binder";
		this.cards.items.footer.pageSize = 100;
	}

	getCards() {
		this.searchCards();
		this.sortCards();
	}
	searchCards() {
		this.cards.items.items = this.originalCards.filter((userCard: UserCard) => {
			return userCard.card.name.toLowerCase().includes(this.cards.items.filter.query.toLowerCase())
				|| userCard.card.type.toLowerCase().includes(this.cards.items.filter.query.toLowerCase());
		});
	}
	sortCards() {
		this.cards.items.items.sort((a: UserCard, b: UserCard): number => {
			switch (this.cards.items.filter.sortBy) {
				case "name": {
					switch (this.cards.items.filter.sortDirection) {
						case "asc": {
							return a.card.name < b.card.name ? -1 : 1;
						}
						case "desc": {
							return a.card.name > b.card.name ? -1 : 1;
						}
					}
				}
				default: {
					switch (this.cards.items.filter.sortDirection) {
						case "asc": {
							return a.updated_at < b.updated_at ? -1 : 1;
						}
						case "desc": {
							return a.updated_at > b.updated_at ? -1 : 1;
						}
					}
				}
			}
			return -1;
		});
	}
}