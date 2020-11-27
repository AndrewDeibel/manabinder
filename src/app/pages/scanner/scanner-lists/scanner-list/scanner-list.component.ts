import { Component, OnInit } from '@angular/core';
import { Card } from '@app/pages/cards/card';
import { ScannerService } from '@app/pages/scanner/scanner.service';
import { Cards } from '@app/pages/cards/cards';
import { MenuItem, Menu } from '@app/controls/menu';
import { Textbox } from '@app/controls/textbox';
import { Button } from '@app/controls/button';
import { Select } from '@app/controls/select';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { CardsService } from '@app/pages/cards';
import { CollectionCardsService } from '@app/pages/collection';
import { ItemsHeader, ItemsFooter, ItemsFilter } from '@app/page/main';
import { Items } from '@app/page/main/items/items';
import { Icons } from '@app/models/icons';
import { DecksService, Deck } from '@app/pages/decks';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { ScannerList } from './scanner-list';

@AutoUnsubscribe()
@Component({
	selector: 'mb-scanner-list',
	templateUrl: './scanner-list.component.html',
})

export class ScannerListComponent implements OnInit {

	query: string = "";
	page: number = 1;
	pageSize: number = 12;
	sortBy: string = "created_date";
	sortDirection: string = "desc";
	loading: boolean;
	cards: Cards;
	addToDeckMenuItem: MenuItem;
	decks: Deck[] = [];

	constructor(
		private authenticationService: AuthenticationService,
		private decksService: DecksService,
		private scannerService: ScannerService,
		private collectionCardsService: CollectionCardsService,
		private cardsService: CardsService) { }

	ngOnDestroy() { }
	ngOnInit() {

		let addToMenuItem = new MenuItem({
			text: "Add to...",
			icon: Icons.plus,
			click: () => {
				let addToCollectionMenuItem = new MenuItem({
					text: "Collection",
					icon: Icons.archive,
					click: () => {
						this.collectionCardsService.addCollectionCards(this.cards.items.items);
					}
				});
				this.addToDeckMenuItem = new MenuItem({
					text: "Deck",
					icon: Icons.deck,
					menu: new Menu({
						maxHeight: "320px"
					})
				});

				// Cache decks
				if (this.decks.length) {
					this.decks.forEach(deck => {
						this.buildAddToDeckMenu(deck, this.cards.items.items);
					});
				}
				else {
					this.decksService.searchDecksObservable().subscribe(result => {
						if (result) {
							this.decks = result.decks;
							result.decks.forEach(deck => {
								this.buildAddToDeckMenu(deck, this.cards.items.items);
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

		// Initalize cards
		this.cards = new Cards({
			hidePaging: true,
			items: new Items({
				buttonNoResults: new Button({
					text: "Scan Cards",
					icon: Icons.scanner,
					route: "/scanner"
				}),
				header: new ItemsHeader({
					title: "Scanner Results",
					icon: Icons.scanner,
					menu: new Menu({
						items: [
							new MenuItem({
								menu: new Menu({
									classes: "anchor-right",
									items: [
										addToMenuItem,
										new MenuItem({
											text: "Clear Scans",
											icon: Icons.close,
											click: () => {
												this.cards.items.header.menu.clearActive();
												this.cards.items.items = [];
												this.scannerService.clearScans();
											}
										})
									]
								})
							})
						]
					})
				}),
				filter: new ItemsFilter({
					textboxSearch: new Textbox({
						icon: Icons.search,
						placeholder: "Search Scanner Results...",
						clickIcon: value => {
							this.query = value;
							this.search();
						},
						keydownEnter: value => {
							this.query = value;
							this.search();
						}
					}),
					selectSortBy: new Select({
						change: value => {
							this.sortBy = value;
							// this.getcards();
						}
					}),
					selectSortDirection: new Select({
						change: value => {
							this.sortDirection = value;
							// this.getCards();
						}
					}),
				}),
				footer: new ItemsFooter({
					buttonPrev: new Button({
						click: () => {
							this.page--;
							// this.getCards();
						}
					}),
					buttonNext: new Button({
						click: () => {
							this.page++;
							//this.nextPage();
						}
					}),
					selectPageSize: new Select({
						change: value => {
							this.pageSize = +value;
							// this.getCards();
						}
					}),
					textboxPage: new Textbox({
					}),
				})
			}),
		});

		// Response from get scans request
		this.scannerService.getScansObservable().subscribe(scans => {
			scans.forEach(card => {
				this.buildCardMenu(card);
			});
			this.cards.items.items = scans;
			this.cards.items.header.subtitle = "cards: " + scans.length;
			let price: number = 0;
			this.cards.items.items.forEach(card => {
				if (card.price) {
					price += card.price;
				}
			})
			this.cards.items.header.price = price;
		});

		// Request scans
		this.scannerService.getScans();
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

	buildCardMenu(card: Card) {

		// Build version menu items
		let versionMenuItems: MenuItem[] = [];
		if (card.alternate_printings.length > 1) {
			card.alternate_printings.forEach(printing => {
				versionMenuItems.push(new MenuItem({
					text: printing.set_name,
					price: printing.price,
					symbol: printing.set_symbol,
					click: (event: Event) => {
						event.stopPropagation();
						this.cardsService.clearCardObservable();
						this.cardsService.cardObservable().subscribe(newCard => {
							if (newCard) {
								newCard.tempId = this.scannerService.getTempId();
								this.scannerService.changeVersion(card, newCard);
								this.cards.items.items = this.scannerService.scannerList.cards;
							}
						});
						this.cardsService.card(printing.id);
					}
				}));
			});
		}

		let versionMenuItem = new MenuItem({
			text: card.set_name,
			symbol: card.set_symbol,
			price: card.price,
			menu: new Menu({
				maxHeight: "320px",
				items: versionMenuItems
			})
		});

		let addToMenuItem = new MenuItem({
			text: "Add to...",
			icon: Icons.plus,
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
						maxHeight: "320px"
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

		let removeMenuItem = new MenuItem({
			icon: Icons.trash,
			text: "Remove",
			click: (event: Event) => {
				event.stopPropagation();
				this.scannerService.removeCard(card);
				this.cards.items.items = this.scannerService.scannerList.cards;
			}
		});

		let cardMenuItem = new MenuItem({
			menu: new Menu({
				classes: "anchor-bottom anchor-left",
			})
		});

		if (card.alternate_printings.length > 1) {
			cardMenuItem.menu.items.push(versionMenuItem);
		}
		cardMenuItem.menu.items.push(addToMenuItem);
		cardMenuItem.menu.items.push(removeMenuItem);

		card.itemsMenu = new Menu({
			clearActiveClickOutside: true,
			classes: "bg round",
			horizontal: true,
			items: [
				cardMenuItem
			]
		});
	}

	search() {
		if (this.query.length) {
			let searchCards = this.scannerService.scannerList.cards.filter(card => {
				return card.name.toLowerCase().includes(this.query.toLowerCase());
			});
			this.cards.items.items = searchCards;
		}
		else {
			this.cards.items.items = this.scannerService.scannerList.cards;
		}
	}

}