import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Menu, MenuItem } from '@app/controls/menu';
import { SearchService } from '@app/page/header/search/search.service';
import { Card } from '@app/pages/cards/card';
import { Cards } from './cards';
import { CardsService, CardResults } from './cards.service';
import { CollectionCardsService } from '../collection/collection-cards/collection-cards.service';
import { ActivatedRoute } from '@angular/router';
import { ItemDisplayType } from '@app/page/main/items/items-filter/items-filter';
import { Icons } from '@app/models/icons';
import { Title } from '@angular/platform-browser';
import { UserCard } from './card/card';
import { Deck } from '../decks/deck/deck';
import { DecksService } from '../decks/decks.service';
import { AuthenticationService } from '../auth/auth.service';
import "@app/extensions/string.extensions";
import { LoaderService } from '@app/controls';

@Component({
    selector: 'mb-cards',
	templateUrl: './cards.component.html',
	styleUrls: ['./cards.component.scss']
})

export class CardsComponent implements OnInit {

	@Input() cards: Cards;

	@Output() outputGetCards: EventEmitter<void> = new EventEmitter;

	// Controls
	headerMenu: Menu;
	addToDeckMenuItem: MenuItem;
	decks: Deck[] = [];

	// Service
	sortByDirection: string;

    constructor(
		private titleService: Title,
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService,
		private cardsService: CardsService,
		private decksService: DecksService,
		private searchService: SearchService,
		private loaderService: LoaderService,
		private collectionCardsService: CollectionCardsService) { 

		// Default
		if (!this.cards) {
			this.cards = new Cards({
				isDefault: true,
			});
		}
	}

    ngOnInit(): void {

		if (this.cards.isDefault) {
			this.cards.items.header.title = "All Cards";
		}

		// Query
		this.route.queryParams.subscribe(params => {
			if (params["search"]) {
				this.cards.items.filter.textboxSearch.value = params["search"];
			}
		});

		// Response quicksearch
        this.searchService.getSearchObservable().subscribe(query => {
			this.cards.items.filter.textboxSearch.value = query;
			this.getCards();
		});
		
		// Response search cards
		if (this.cards.isDefault) {
			this.cardsService.searchCardsObservable().subscribe(res => {
				this.getCardsResponse(res);
			});
		}

		// Response all cards
		this.cardsService.allCardsObservable().subscribe(res => {
			this.getCardsResponse(res);
		});
	}
	
	getCardsResponse(res: CardResults) {
		if (res) {
			this.loaderService.hide();

			// User cards
			if (res.userCards) {
				let cards: Card[] = [];
				res.userCards.forEach(userCard => {
					cards.push(userCard.card);
				});
				this.cards.items.items = cards;
			}

			// cards
			else {
				this.cards.items.items = res.cards;
			}

			this.setupDefaultCardsMenu();
			this.cards.items.footer.totalPages = res.total_pages;
			this.cards.totalCards = res.total_results;
			this.cards.items.header.subtitle = `cards: ${res.total_results}`;
			this.titleService.setTitle(`Mana Binder: ${this.cards.items.header.title}`);
		}
	}

	setupDefaultCardsMenu() {
		this.cards.items.items.forEach((card: Card) => {
			this.setupDefaultCardMenu(card);
		});
	}

	setupDefaultCardMenu(card: Card) {
		if (!card.itemsMenu || card.itemsMenu.items.length == 0) {

			var addToMenuItem = new MenuItem({
				text: "Add to...",
				icon: Icons.plus,
				menu: new Menu(),
				click: () => {
					let addToCollectionMenuItem = new MenuItem({
						text: "Collection",
						icon: Icons.archive,
						click: () => {
							card.itemsMenu.clearActive();
							this.collectionCardsService.addCollectionCards([card]);
						}
					});
					this.addToDeckMenuItem = new MenuItem({
						text: "Deck",
						icon: Icons.deck,
						menu: new Menu({
							maxHeight: "180px"
						})
					});
	
					// Cache decks
					if (this.decks.length) {
						this.decks.forEach(deck => {
							this.buildAddToDeckMenu(deck, [card]);
						});
					}
					else {
						this.decksService.searchDecksObservable().subscribe(result => {
							if (result) {
								this.decks = result.decks;
								result.decks.forEach(deck => {
									this.buildAddToDeckMenu(deck, [card]);
								});
							}
						});
						this.decksService.searchDecks({
							page: 1,
							page_size: 100,
							query: '',
							sort_by: 'created_at',
							sort_direction: 'desc',
							user_id: this.authenticationService.currentUserValue.id
						});
					}
	
					let addToBinderMenuItem = new MenuItem({
						text: "Binder",
						icon: Icons.binders,
						click: () => {
							
						}
					});
					addToMenuItem.menu = new Menu({
						classes: "anchor-right",
						items: [
							addToCollectionMenuItem,
							this.addToDeckMenuItem,
							addToBinderMenuItem
						]
					});
				}
			});

			var expandMenuItem = new MenuItem({
				click: () => {
					this.clearActiveCardMenu();
				},
				menu: new Menu({
					minWidth: "154px",
					classes: this.getCardMenuAnchorClasses(this.cards.items.itemDisplayType),
					items: [
						addToMenuItem
					]
				})
			});

			card.itemsMenu = new Menu({
				clearActiveClickOutside: true,
				classes: "round bg",
				horizontal: true,
				items: [
					expandMenuItem
				]
			});
		}
	}

	buildAddToDeckMenu(deck: Deck, cards: Card[]) {
		this.addToDeckMenuItem.menu.items.push(new MenuItem({
			text: deck.name,
			click: () => {
				this.cards.items.header.menu.clearActive();
				this.collectionCardsService.addCollectionCardsObservable().subscribe(res => {
					if (res) {
						this.decksService.addDeckCards({
							user_cards: JSON.stringify(res),
							user_deck_id: deck.id
						})
					}
				});
				this.collectionCardsService.addCollectionCards(cards);
			}
		}));
	}

	clearActiveCardMenu() {
		// Loop through all cards
		this.cards.items.items.forEach(card => {
			if (card instanceof UserCard) {
				if (card.card.itemsMenu) {
					card.card.itemsMenu.clearActive();
				}
			}
			else if (card instanceof Card) {
				if (card.itemsMenu) {
					card.itemsMenu.clearActive();
				}
			}
		});
	}

	getCardMenuAnchorClasses(type: ItemDisplayType) {
		switch (type) {
			case ItemDisplayType.list: {
				return "anchor-top anchor-right";
				break;
			}
			case ItemDisplayType.grid: {
				return "anchor-bottom anchor-left";
				break;
			}
			case ItemDisplayType.visual: {
				return "anchor-top anchor-right";
				break;
			}
			case ItemDisplayType.simple: {
				return "anchor-top anchor-right";
				break;
			}
		}
	}

	displayModeChanged() {
		
		// Update menu position
		let classes: string = this.getCardMenuAnchorClasses(this.cards.items.itemDisplayType);

		// Loop through all cards
		this.cards.items.items.forEach(card => {
			if (card instanceof UserCard) {
				if (card.card.itemsMenu) {
					card.card.itemsMenu.clearActive();
					card.card.itemsMenu.horizontal = true;
					if (card.card.itemsMenu.items.length) {
						card.card.itemsMenu.items[0].menu.classes = classes
					}
				}
			}
			else if (card instanceof Card) {
				if (card.itemsMenu) {
					card.itemsMenu.clearActive();
					card.itemsMenu.horizontal = true;
					if (card.itemsMenu.items.length) {
						card.itemsMenu.items[0].menu.classes = classes
					}
				}
			}
		});
	}

	getItems() {
		// Set to false in cases like Sets where ID Set isn't known until get set is returned
		//if (this.cards.getCardsOnInit) {
			if (this.cards.isDefault) {
				this.getCards();
			}
			else {
				this.outputGetCards.emit();
			}
		//}
	}

    getCards() {
       	this.loaderService.show();

		// Sort by + direction
		if (this.cards.items.filter.selectSortBy.value == "released_at" &&
			this.cards.items.filter.selectSortDirection.value == "desc") {
			this.sortByDirection = "cards";
		}
		else if (this.cards.items.filter.selectSortBy.value == "released_at") {
			this.sortByDirection = "cards_release_date_" + this.cards.items.filter.selectSortDirection.value;
		}
		else {
			this.sortByDirection = "cards_" + this.cards.items.filter.selectSortBy.value + "_" + this.cards.items.filter.selectSortDirection.value;
		}

		if (this.cards.items.filter.textboxSearch.value.length > 0) {
			this.cards.items.header.icon = Icons.search,
			this.cards.items.header.title = "Search Results";
			this.cardsService.searchCards({
				page: this.cards.items.footer.page,
				page_size: this.cards.items.footer.pageSize,
				query: this.cards.items.filter.query,
				language_id: 1,
				sort_by: this.sortByDirection,
			});
		}
		else {
			this.cards.items.header.icon = Icons.archive;
			this.cards.items.header.title = "All Cards";
			this.cardsService.allCards({
				page: this.cards.items.footer.page,
				page_size: this.cards.items.footer.pageSize,
				sort_by: this.sortByDirection,
				language_id: 1
			});
		}
	}
}