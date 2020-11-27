import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SetsService } from '@app/pages/sets/sets.service';
import { Set } from './set';
import { Cards } from '@app/pages/cards/cards';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { CardsComponent } from '@app/pages/cards';
import { DatePipe } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { LoaderService } from '@app/controls';

@AutoUnsubscribe()
@Component({
    selector: 'mb-set',
	templateUrl: './set.component.html'
})

export class SetComponent implements OnInit {

	@ViewChild(CardsComponent) cardsComponent: CardsComponent;

	code: string;
	set: Set;
	cards: Cards;

    constructor(
		private loaderService: LoaderService,
		private titleService: Title,
		private datePipe: DatePipe,
        private setsService: SetsService,
        private route: ActivatedRoute) { }

	ngOnDestroy() { }
    ngOnInit(): void {

		// Init cards
		this.cards = new Cards({ getCardsOnInit: false });
		this.cards.items.filter.sortBy = "price";
		this.cards.items.filter.selectSortBy.value = "price";
		
		// Get id from route
		this.route.params.subscribe(params => {
			this.code = params["code"];

			// Request set from server
			this.loaderService.show();
			this.setsService.set(this.code);

		});

		// Response from set request
		this.setsService.setObservable().subscribe(set => {
			if (set) {
				this.set = set;

				// Request set cards from server
				this.getCards();
			}
		});

		// Response from set cards request
		this.setsService.searchSetCardsObservable().subscribe(results => {
			this.loaderService.hide();
			if (results) {
				this.cards.totalCards = results.total_results;
				this.cards.items.items = results.cards;
				this.cards.items.footer.totalPages = results.total_pages;
				this.cards.items.footer.textboxPage.max = results.total_pages;
				this.cards.items.header.title = this.set.name;
				this.titleService.setTitle(`Mana Binder: ${this.set.name}`);
				this.cards.items.header.subtitle = `cards: ${this.set.total_cards} - released: ${this.datePipe.transform(this.set.release_date)}`;
				this.cards.items.header.symbol = this.set.symbol;
				this.cards.items.filter.textboxSearch.placeholder = "Search " + this.set.name + " cards...";
				if (this.cardsComponent) {
					this.cardsComponent.setupDefaultCardsMenu();
				}
			}
		});
	}

	getCards() {
		// Set.id won't be know until response from get set (code is known)
		// Cards sub component will attempt to call getCards() on init
		if (this.set && this.set.id > 0) {
			this.loaderService.show();
			this.setsService.searchSetCards({
				set_id: this.set.id,
				page: this.cards.items.footer.page,
				page_size: this.cards.items.footer.pageSize,
				query: this.cards.items.filter.query,
				sort_by: this.cards.items.filter.sortBy,
				sort_direction: this.cards.items.filter.sortDirection
			});
		}
	}

}