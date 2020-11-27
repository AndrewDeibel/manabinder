import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Icons } from '@app/models/icons';
import { DecksService } from '../decks.service';
import { ActivatedRoute } from '@angular/router';
import { Cards } from '@app/pages/cards/cards';
import { UserCard } from '@app/pages/cards/card/card';
import { DatePipe } from '@angular/common';
import { Tag } from '@app/controls/tag';
import { Menu, MenuItem } from '@app/controls/menu';
import { SelectOption } from '@app/controls/select';
import { Deck } from './deck';
import { Title } from '@angular/platform-browser';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { AddCards } from '@app/controls/add-cards/add-cards';
import { CollectionCardsService } from '@app/pages/collection/collection-cards/collection-cards.service';
import { CollectionDecksService } from '@app/pages/collection/collection-decks/collection-decks.service';
import { ItemDisplayType } from '@app/page/main/items/items-filter/items-filter';
import { LoaderService } from '@app/controls';

@Component({
	selector: 'mb-deck',
	templateUrl: 'deck.component.html',
	styleUrls: ['./deck.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class DeckComponent implements OnInit {

	cards: Cards;
	originalCards: UserCard[] = [];
	id: number;
	showCards: boolean = true;
	showDescription: boolean = false;
	deck: Deck;
	tags: Tag[] = [];
	addCards: AddCards;
	menu: Menu;
	showAddCards: boolean = true;

	constructor(
		private collectionCardsService: CollectionCardsService,
		private collectionDecksService: CollectionDecksService,
		private titleService: Title,
		private datePipe: DatePipe,
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService,
		private decksService: DecksService,
		private loaderService: LoaderService
	) {}

	ngOnInit() {

		this.buildControls();

		// Response get deck
		this.decksService.getDeckObservable().subscribe(deck => {
			if (deck) {
				this.responseDeck(deck);
			}
		});

		// Response update deck
		this.collectionDecksService.updateDeckObservable().subscribe(deck => {
			if (deck) {
				this.responseDeck(deck);
			}
		});

		// Response remove deck card
		this.decksService.removeDeckCardObservable().subscribe(deck => {
			if (deck) {
				this.responseDeck(deck);
			}
		});

		// ID param
		this.route.params.subscribe(params => {
			this.id = +params["id"];
		
			// Request deck
			this.getDeck();
		});
	}

	getDeck() {
		this.loaderService.show();
		this.decksService.getDeck(this.id);
	}

	responseDeck(deck: Deck) {
		this.loaderService.hide();
		this.deck = deck;
		this.cards.items.header.title = deck.name
		this.titleService.setTitle(`Mana Binder: Deck - ${deck.name}`);
		this.cards.items.header.subtitle = `cards: ${deck.cards.length} - created: ${this.datePipe.transform(deck.created_at)}`;
		this.cards.items.header.price = deck.stats.total_value;

		if (this.deck.tags != null) {
			this.deck.tags.split(' ').forEach(tag => {
				this.tags.push(new Tag({
					text: tag
				}));
			});
		}

		// TODO: Move tags to description tab
		// this.cards.items.header.tags.push(new Tag({
		// 	text: deck.format.name,
		// 	classes: "primary"
		// }))
		// this.cards.items.header.tags = [];
		// if (deck.tags !== null) {
		// 	deck.tags.split(' ').forEach(tag => {
		// 		this.cards.items.header.tags.push(new Tag({
		// 			text: tag
		// 		}));
		// 	});
		// }
		
		let cards: UserCard[] = [];
		deck.cards.forEach(card => {
			cards.push(new UserCard(card));
		});
		this.cards.items.items = cards;
		this.originalCards = cards;

		this.addCards.user_deck_id = deck.id;

		this.sortCards();

		// Header menu
		this.cards.items.header.menu = new Menu({
			horizontal: true,
			classes: "round",
			items: [
				new MenuItem({
					classesLink: "button",
					text: "Playtest",
					icon: Icons.play,
					route: `/playtest/${this.deck.id}`
				})
			]
		});

		// Owner permissions
		if (deck.user_id === this.authenticationService.currentUserValue.id) {

			this.showAddCards = true;

			// Header edit button
			this.cards.items.header.menu.items.unshift(new MenuItem({
				text: "Edit",
				icon: Icons.edit,
				classesLink: "button secondary",
				route: `/decks/${deck.id}/edit`
			}));

			// Card edit menu
			this.buildCardMenus();
		}
	}

	buildControls() {
		this.buildTabs();
		this.buildAddCards();
		this.buildCards();
	}

	buildCards() {
		this.cards = new Cards();
		this.cards.items.header.icon = Icons.deck;
		this.cards.items.showHeader = false;
		this.cards.items.showFooter = false;
		this.cards.items.filter.showSimpleDisplayMode = true;
		this.cards.items.filter.showVisualDisplayMode = true;
		this.cards.items.filter.displayMode = ItemDisplayType.visual;
		this.cards.items.itemDisplayType = ItemDisplayType.visual;
		this.cards.items.filter.textboxSearch.placeholder = "Search cards in deck...";
		this.cards.items.noResults = "No cards found in deck";
		this.cards.items.footer.pageSize = 100;
		this.cards.items.filter.selectSortBy.optionGroups.forEach(optGroup => {
			optGroup.options = [
				new SelectOption({
					text: "Date Added",
					value: "released_at",
					selected: true,
				}),
				new SelectOption({
					text: "Name",
					value: "name"
				})
			];
		});
		this.cards.items.filter.selectSortBy.value = "released_at";
		this.cards.items.filter.selectSortDirection.value = "desc";
		// this.cards.items.buttonNoResults = new Button({
		// 	text: "Add Cards",
		// 	icon: Icons.plus,
		// 	click: () => {
				
		// 	}
		// });
	}

	buildAddCards() {
		this.addCards = new AddCards();
	}

	buildTabs() {
		let menuItemCards = new MenuItem({
			text: "Cards",
			active: true,
			icon: Icons.cards,
			click: () => {
				this.menu.clearActive();
				menuItemCards.active = true;
				this.showCards = true;
				this.showDescription = false;
				this.showAddCards = true;
			}
		});
		let menuItemDescription = new MenuItem({
			text: "Description",
			icon: Icons.text,
			click: () => {
				this.menu.clearActive();
				menuItemDescription.active = true;
				this.showCards = false;
				this.showDescription = true;
				this.showAddCards = false;
			}
		});
		this.menu = new Menu({
			clearActiveClickOutside: false,
			horizontal: true,
			items: [
				menuItemCards,
				menuItemDescription,
				// new MenuItem({
				// 	text: "Stats",
				// 	icon: Icons.stats
				// }),
			]
		});
	}

	buildCardMenus() {
		this.cards.items.items.forEach(userCard => {
			this.buildCardMenu(userCard);
		});
		this.deck.commanders.forEach(userCard => {
			this.buildCardMenu(userCard, true);
		});
	}

	buildCardMenu(userCard: UserCard, commander: boolean = false) {

		// Versions
		let versionMenuItems: MenuItem[] = [];
		if (userCard.card.alternate_printings && userCard.card.alternate_printings.length) {
			userCard.card.alternate_printings.forEach(printing => {
				versionMenuItems.push(new MenuItem({
					text: printing.set_name,
					price: printing.price,
					symbol: printing.set_symbol,
					click: () => {

						// Response from update
						this.collectionCardsService.updateCollectionCardObservable().subscribe(userCard => {

							// Refresh data
							this.getCards();
						});

						// Update the user card
						userCard.card_id = printing.id

						// Request update
						this.collectionCardsService.updateCollectionCard(userCard);
					}
				}))
			});
		}

		let versionMenuItem = new MenuItem({
			text: userCard.card.set_name,
			symbol: userCard.card.set_symbol,
			price: userCard.card.price,
			menu: new Menu({
				maxHeight: "320px",
				items: versionMenuItems
			})
		});

		// Remove
		let removeMenuItem = new MenuItem({
			icon: Icons.trash,
			text: "Remove",
			click: () => {
				if (confirm(`Are you sure you want to remove ${userCard.card.name} from this deck?`)) {
					this.decksService.removeDeckCard({
						user_deck_id: this.deck.id,
						user_card_id: userCard.id
					});
				}
			}
		});

		userCard.card.itemsMenu = new Menu({
			clearActiveClickOutside: true,
			classes: "bg round",
			horizontal: true,
			items: [
				new MenuItem({
					menu: new Menu({
						classes: commander ? "anchor-bottom anchor-left" : "anchor-top anchor-right",
						items: [
							removeMenuItem,
							versionMenuItem
						]
					})
				})
			]
		});

		// Commander
		if (this.deck.format_id === 1) {
			if (userCard.card.itemsMenu.items.length === 1) {
				if (userCard.card.itemsMenu.items[0].menu != null) {

					if (!commander) {
						userCard.card.itemsMenu.items[0].menu.items.splice(
							1,
							0,
							new MenuItem({
								icon: Icons.swords,
								text: "Set as Commander",
								click: () => {
									this.deck.commander_ids = this.deck.commander_ids.filter(id => {
										return id !== userCard.card.id;
									});
									this.deck.commander_ids.push(userCard.card.id);
									this.collectionDecksService.updateDeck({
										archetype: this.deck.archetype,
										commander_ids: JSON.stringify(this.deck.commander_ids),
										companion_id: this.deck.companion_id,
										deck_id: this.deck.id,
										format_id: this.deck.format_id,
										metadata: "",
										name: this.deck.name,
										power_level: this.deck.power_level,
										public: this.deck.public,
										short_description: this.deck.short_description,
										tags: this.deck.tags
									});
									userCard.card.itemsMenu.clearActive();
								}
							})
						);
					}
					else {
						userCard.card.itemsMenu.items[0].menu.items.splice(
							1,
							0,
							new MenuItem({
								icon: Icons.swords,
								text: "Unset as Commander",
								click: () => {
									this.deck.commander_ids = this.deck.commander_ids.filter(id => {
										return id !== userCard.card.id;
									});
									this.collectionDecksService.updateDeck({
										archetype: this.deck.archetype,
										commander_ids: JSON.stringify(this.deck.commander_ids),
										companion_id: this.deck.companion_id,
										deck_id: this.deck.id,
										format_id: this.deck.format_id,
										metadata: "",
										name: this.deck.name,
										power_level: this.deck.power_level,
										public: this.deck.public,
										short_description: this.deck.short_description,
										tags: this.deck.tags
									});
									userCard.card.itemsMenu.clearActive();
								}
							})
						);
					}
				}
			}
		}
	}

	cardAdded() {
		this.getDeck();
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