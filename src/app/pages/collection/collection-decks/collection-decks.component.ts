import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { Decks } from '@app/pages/decks/decks';
import { CollectionDecksService } from './collection-decks.service';
import { Button } from '@app/controls/button';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Icons } from '@app/models/icons';
import { LoaderService } from '@app/controls';

@AutoUnsubscribe()
@Component({
	selector: 'mb-collection-decks',
	templateUrl: 'collection-decks.component.html'
})

export class CollectionDecksComponent implements OnInit {

	decks: Decks;

	constructor(
		private loaderService: LoaderService,
		private authenticationService: AuthenticationService,
		private collectionDecksService: CollectionDecksService
	) { }

	ngOnDestroy() { }
	ngOnInit() {

		// Init decks
		this.decks = new Decks();
		this.decks.outputGetItems = true;
		this.decks.items.header.icon = Icons.deck;
		this.decks.items.header.title = "Collection";
		this.decks.items.filter.textboxSearch.placeholder = "Search collection decks...";
		this.decks.items.noResults = "No decks found";
		this.decks.items.filter.sortBy = "created_at";
		this.decks.items.filter.showListDisplayMode = false;
		this.decks.items
		this.decks.items.buttonNoResults = new Button({
			text: "Create Deck",
			icon: Icons.plus,
			route: "/decks/new"
		});
		this.decks.items.header.button = new Button({
			text: "Create Deck",
			icon: Icons.plus,
			route: "/decks/new"
		});

		// Response get decks
		this.collectionDecksService.searchDecksObservable().subscribe(res => {
			if (res) {
				this.loaderService.hide();
				this.decks.items.items = res.decks;
				this.decks.items.footer.totalPages = res.total_pages;
				this.decks.items.header.subtitle = `decks: ${res.total_results}`;
			}
		});
	}

	getItems() {
		this.loaderService.show();
		this.collectionDecksService.searchDecks({
			page: this.decks.items.footer.page,
			page_size: this.decks.items.footer.pageSize,
			query: this.decks.items.filter.query,
			sort_by: this.decks.items.filter.sortBy,
			sort_direction: this.decks.items.filter.sortDirection,
			user_id: this.authenticationService.currentUserValue.id
		});
	}
}