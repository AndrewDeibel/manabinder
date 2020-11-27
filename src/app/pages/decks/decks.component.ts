import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Button } from '@app/controls/button';
import { Decks } from './decks';
import { DecksService } from './decks.service';
import { Icons } from '@app/models/icons';
import { LoaderService } from '@app/controls';

@Component({
    selector: 'mb-decks',
	templateUrl: './decks.component.html',
	styleUrls: ['./decks.component.scss']
})

export class DecksComponent implements OnInit {

	@Input() decks: Decks;
	@Output() outputGetItems: EventEmitter<void> = new EventEmitter;

    constructor(
		private decksService: DecksService,
		private loaderSerivce: LoaderService) {}

    ngOnInit(): void {

		// Init
		if (!this.decks) {
			this.decks = new Decks();
			this.decks.items.header.title = "All Decks",
			this.decks.items.filter.sortBy = "created_at";
			this.decks.items.filter.showListDisplayMode = false;
			this.decks.items.header.icon = Icons.deck,
			this.decks.items.filter.textboxSearch.placeholder = "Search decks...";
			this.decks.items.noResults = "No decks found";
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
		}

		// Response search decks
		this.decksService.searchDecksObservable().subscribe(res => {
			if (res) {
				this.loaderSerivce.hide();
				this.decks.items.items = res.decks;
				this.decks.items.footer.totalPages = res.total_pages;
				this.decks.items.header.subtitle = `decks: ${res.total_results}`;
			}
		});
	}

	getItems() {
		// Get items controlled by parent
		if (this.decks.outputGetItems) {
			this.outputGetItems.emit();
		}
		else {
			this.loaderSerivce.show();
	
			this.decksService.searchDecks({
				page: this.decks.items.footer.page,
				page_size: this.decks.items.footer.pageSize,
				query: this.decks.items.filter.query,
				sort_by: this.decks.items.filter.sortBy,
				sort_direction: this.decks.items.filter.sortDirection
			});
		}
	}

}