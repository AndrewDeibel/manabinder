import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { SearchService } from '@app/page/header/search/search.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Card } from '@app/pages/cards/card';
import { Menu, MenuItem } from '@app/controls/menu';
import { SearchCardsParams, CardsService } from '@app/pages/cards/cards.service';

@Component({
	selector: 'mb-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class SearchComponent implements OnInit {

	query: string = "";
	cards: Card[] = [];
	loading: boolean = false;
	lastQuery: string = "";
	paramsSearch: SearchCardsParams = {
		page: 1,
		page_size: 10,
		query: "",
		language_id: 1,
		sort_by: "cards",
	};
	menuCards: Menu = new Menu();
	menuCardsShow: boolean = false;

	constructor(
		private searchService: SearchService,
		private router: Router,
		private route: ActivatedRoute,
		private cardsService: CardsService) { }

	ngOnInit(): void {

		// Get query from route
		this.route.queryParams.subscribe(params => {
			if (params["quicksearch"]) {
				this.query = params["quicksearch"];
			}
		});

		// Initalize menu
		this.menuCards = new Menu({
			classes: "round-bottom borders menuSearchResults",
		});

		// Subscribe to autocomplete
		this.cardsService.autoCompleteCardsObservable().subscribe(_cards => {
			this.cards = [];
			this.menuCardsShow = false;
			this.menuCards.items = [];
			this.lastQuery = this.query;
			this.loading = false;
			if (_cards.length > 0) {
				this.menuCardsShow = true;
				this.cards = _cards;
				this.cards.forEach(card => {
					this.menuCards.items.push(new MenuItem({
						text: card.name,
						route: card.route,
						symbol: card.set_symbol,
						price: card.price,
						click: () => {
							this.menuCardsShow = false;
						}
					}));
				});
			}
		});
	}

	search() {
		this.router.navigate(['/cards'], {
			queryParams: {
				search: this.query
			}
		})
		//this.router.navigateByUrl('/cards');
		this.searchService.setSearch(this.query);
		this.menuCardsShow = false;
	}

	autocomplete() {
		this.menuCardsShow = true;
		// Only autocomplete if query is different than last query
		if (this.query.trim().toLowerCase() !== this.lastQuery.trim().toLowerCase()) {
			this.loading = true;
			this.paramsSearch.query = this.query;
			this.cardsService.autoCompleteCards(this.paramsSearch);
		}
	}

	keyupTimeout: any;
	keyup(event: KeyboardEvent) {
		clearInterval(this.keyupTimeout);

		// Don't trigger auto complete when enter key pressed
		if (event.key !== "Enter") {
			if (this.query.length >= 3) {
				this.keyupTimeout = setTimeout(() => {
					this.autocomplete();
				}, 400);
			}
			else {
				this.menuCardsShow = false;
			}
		}
		else {
			this.menuCardsShow = false;
		}
	}

	clear(textboxEl: HTMLElement) {
		this.query = "";
		this.menuCardsShow = false;
		this.cards = [];
		// Set focus
		textboxEl.focus();
	}

	clickOutside() {
		this.menuCardsShow = false;
	}

	click() {
		if (this.cards && this.cards.length) {
			this.menuCardsShow = true;
		}
	}
}