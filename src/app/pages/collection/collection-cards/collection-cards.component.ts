import { Component, OnInit, ViewChild } from '@angular/core';
import { Cards } from '@app/pages/cards/cards';
import { CardsService } from '@app/pages/cards/cards.service';
import { Card, UserCard } from '@app/pages/cards/card/card';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { MenuItem, Menu,  } from '@app/controls/menu';
import { SelectOptionGroup, SelectOption } from '@app/controls/select';
import { CollectionCardsService } from './collection-cards.service';
import { DecksService } from '@app/pages/decks/decks.service';
import { Icons } from '@app/models/icons';
import { CardsComponent } from '@app/pages/cards/cards.component';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Deck } from '@app/pages/decks/deck/deck';

@AutoUnsubscribe()
@Component({
	selector: 'mb-collection-cards',
	templateUrl: 'collection-cards.component.html'
})

export class CollectionCardsComponent implements OnInit {

	//@ViewChild(CardsComponent) cardsComponent: CardsComponent;

	loading: boolean = true;
	cards: Cards;
	decks: Deck[] = [];

	// Controls
	addToDeckMenuItem: MenuItem;

	constructor(
		private authenticationService: AuthenticationService,
		private decksService: DecksService,
		private collectionCardsService: CollectionCardsService,
		private cardsService: CardsService) { }

	ngOnDestroy() { }
	ngOnInit() {

		this.setupControls();

		// Response collection cards
		this.collectionCardsService.searchCollectionCardsObservable().subscribe(results => {
			if (results) {
				this.loading = false;
				let userCards: UserCard[] = [];

				// Build cards
				results.userCards.forEach(userCard => {
					let _userCard: UserCard = new UserCard(userCard);
					_userCard.card = this.buildCardMenu(userCard.card);
					userCards.push(_userCard);
				});
				
				this.cards.totalCards = results.total_results;
				this.cards.items.items = userCards;
				this.cards.items.footer.totalPages = results.total_pages;
				this.cards.items.footer.textboxPage.max = results.total_pages;
				this.cards.items.header.subtitle = `cards: ${results.total_results}`;
				this.cards.items.header.price = results.total_value;
			}
		});

		// Response delete collection card
		this.collectionCardsService.removeCollectionCardsObservable().subscribe(cardIds => {
			if (cardIds.length) {
				this.getCards();
			}
		});
	}

	setupControls() {
		// this.cards.items.header.menu = new Menu({
		// 	clearActiveClickOutside: true,
		// 	items: [
		// 		new MenuItem({
		// 			icon: Icons.ellipsisV,
		// 			menu: new Menu({
		// 				classes: "anchor-right",
		// 				items: [
		// 					// new MenuItem({
		// 					// 	text: "Add all to deck",
		// 					// 	icon: Icons.plus,
		// 					// 	click: () => {
		// 					// 		let userCardIds: number[] = [];
		// 					// 		this.cards.items.items.forEach((userCard: UserCard) => {
		// 					// 			userCardIds.push(userCard.id);
		// 					// 		});
		// 					// 		this.decksService.addDeckCards({
		// 					// 			user_cards: JSON.stringify(userCardIds),
		// 					// 			user_deck_id: 1
		// 					// 		});
		// 					// 		//this.collectionCardsService.addCollectionCards(this.cards.items.items);
		// 					// 	}
		// 					// })
		// 				]
		// 			})
		// 		})
		// 	]
		// });

		// Init cards
		this.cards = new Cards;
		this.cards.items.header.icon = Icons.archive;
		this.cards.items.header.title = "Collection";
		this.cards.items.filter.textboxSearch.placeholder = "Search collection cards...";
		this.cards.items.footer.pageSize = 100;

		// Sort by
		this.cards.items.filter.selectSortBy.optionGroups = [
			new SelectOptionGroup({
				label: "Sort By",
				options: [
					new SelectOption({
						text: "Date Added",
						value: "created_at",
					}),
					new SelectOption({
						text: "Date Updated",
						value: "updated_at"
					}),
					new SelectOption({
						text: "Name",
						value: "name"
					}),
					new SelectOption({
						text: "Price",
						value: "price"
					})
				]
			})
		];
		this.cards.items.filter.sortBy = "created_at";
		this.cards.items.filter.selectSortBy.value = "created_at";
		// Sort direction
		this.cards.items.filter.selectSortDirection.value = "desc";
		// Page size
		this.cards.items.footer.pageSize = 100;
	}

	buildCardMenu(card: Card) {

		// Versions
		let versionMenuItems: MenuItem[] = [];
		if (card.alternate_printings.length) {
			card.alternate_printings.forEach(printing => {
				versionMenuItems.push(new MenuItem({
					text: printing.set_name,
					price: printing.price,
					symbol: printing.set_symbol,
					click: (event: Event) => {
						
						// Response form update
						this.collectionCardsService.updateCollectionCardObservable().subscribe(userCard => {

							// Refresh data
							this.getCards();
						});

						// Update the user card
						card.userCard.card_id = printing.id;

						// Request update
						this.collectionCardsService.updateCollectionCard(card.userCard);
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

		// Add to...
		let addToMenuItem = new MenuItem({
			icon: Icons.plus,
			text: "Add to...",
			menu: new Menu(),
			click: () => {
				this.addToDeckMenuItem = new MenuItem({
					icon: Icons.deck,
					text: "Deck",
					//classesLink: "no-ellipsis",
					menu: new Menu({
						maxHeight: "320px"
					})
				});

				// Cache decks
				if (this.decks.length) {
					this.decks.forEach(deck => {
						this.buildAddToDeckMenu(deck, card);
					});
				}
				else {
					this.decksService.searchDecksObservable().subscribe(result => {
						if (result) {
							this.decks = result.decks;
							result.decks.forEach(deck => {
								this.buildAddToDeckMenu(deck, card);
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
					icon: Icons.binders,
					text: "Binder",
					menu: new Menu({
						maxHeight: "320px"
					})
				});
				addToMenuItem.menu.items.push(
					this.addToDeckMenuItem,
					addToBinderMenuItem
				);
			},
		});

		// Remove
		let removeMenuItem = new MenuItem({
			icon: Icons.trash,
			text: "Remove",
			click: (event: Event) => {
				if (confirm(`Are you sure you want to remove ${card.name} from your collection?`)) {
					this.collectionCardsService.removeCollectionCards([card.userCard]);
				}
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

		return card;
	}

	buildAddToDeckMenu(deck: Deck, card: Card) {
		this.addToDeckMenuItem.menu.items.push(new MenuItem({
			text: deck.name,
			click: () => {
				card.itemsMenu.clearActive();
				this.decksService.addDeckCards({
					user_cards: JSON.stringify([
						card.userCard.id
					]),
					user_deck_id: deck.id
				});
			}
		}));
	}

	getCards() {
		this.loading = true;
		this.collectionCardsService.searchCollectionCards({
			page: this.cards.items.footer.page,
			page_size: this.cards.items.footer.pageSize,
			query: this.cards.items.filter.query,
			sort_by: this.cards.items.filter.sortBy,
			sort_direction: this.cards.items.filter.sortDirection
		});
	}

}