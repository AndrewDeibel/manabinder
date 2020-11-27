import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Size } from '@app/models/size';
import { Menu, MenuItem } from '@app/controls/menu';
import { Card } from './card';
import { ActivatedRoute } from '@angular/router';
import { CardsService } from '../cards.service';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { CollectionCardsService } from '@app/pages/collection/collection-cards/collection-cards.service';
import "@app/extensions/string.extensions";
import { ItemsHeader } from '@app/page/main/items/items-header/items-header';
import { Icons } from '@app/models/icons';
import { Deck } from '@app/pages/decks/deck';
import { DecksService } from '@app/pages/decks/decks.service';
import { LoaderService } from '@app/controls';

@Component({
    selector: 'mb-card',
	templateUrl: './card.component.html',
	styleUrls: ['./card.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class CardComponent implements OnInit {

	@Input() card: Card;
	decks: Deck[] = [];
	addToDeckMenuItem: MenuItem;
	itemsHeader: ItemsHeader;
    menu: Menu = new Menu();
	footerMenu: Menu;
    id: number;

    cardImageHover: boolean = false;

    constructor(
		private decksService: DecksService,
		private loaderService: LoaderService,
        private cardsService: CardsService,
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService,
		private collectionCardsService: CollectionCardsService) {}

    ngOnInit(): void {
		
		this.loaderService.show();

		// Detail menu
        this.menu.horizontal = true;
        this.menu.items.push(
            new MenuItem({
                text: "Details",
                icon: Icons.list,
                route: "details"
            }),
            // new MenuItem({
            //     text: "Collection",
			// 	icon: Icons.archive,
			// 	route: "collection"
            // }),
            // new MenuItem({
            //     text: "Decks",
			// 	icon: Icons.deck,
			// 	route: "decks"
			// }),
			new MenuItem({
				text: "Legality",
				icon: Icons.judge,
				route: "legality"
			}),
            // new MenuItem({
            //     text: "Stats",
			// 	icon: Icons.stats,
			// 	route: "stats"
            // }),
		)

		// Response get card
		this.cardsService.cardObservable().subscribe(card => {
			if (card) {
				this.loaderService.hide();
				this.card = card;
				this.itemsHeader = new ItemsHeader();
				this.itemsHeader.title = card.name;
				this.itemsHeader.subtitle = card.type;
				this.itemsHeader.symbol = card.set_symbol;
				this.buildCardMenu();
				this.buildFooterMenu();
			}
		});
		
		// ID param
		this.route.params.subscribe(params => {
			this.id = +params["id"];
			this.loaderService.show();

			// Request card
			this.cardsService.card(this.id);
		});
	}
	
	alphaBorderRadius() {
		if (this.card.set_name == "Limited Edition Alpha") {
			return "border-radius-apha";
		}
	}

	buildCardMenu() {
		let addToMenuItem = new MenuItem({
			text: "Add to...",
			icon: Icons.plus,
			menu: new Menu(),
			click: () => {
				let addToCollectionMenuItem = new MenuItem({
					text: "Collection",
					icon: Icons.archive,
					click: () => {
						this.card.itemsMenu.clearActive();
						this.collectionCardsService.addCollectionCards([this.card]);
					}
				});
				this.addToDeckMenuItem = new MenuItem({
					text: "Deck",
					icon: Icons.deck,
					menu: new Menu({
						maxHeight: "170px"
					})
				});

				// Cache decks
				if (this.decks.length) {
					this.decks.forEach(deck => {
						this.buildAddToDeckMenu(deck, [this.card]);
					});
				}
				else {
					this.decksService.searchDecksObservable().subscribe(result => {
						if (result) {
							this.decks = result.decks;
							result.decks.forEach(deck => {
								this.buildAddToDeckMenu(deck, [this.card]);
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
			},
		});
		var expandMenuItem = new MenuItem({
			menu: new Menu({
				minWidth: "154px",
				classes: "anchor-bottom anchor-left round",
				items: [
					addToMenuItem
				]
			})
		});

		this.card.itemsMenu = new Menu({
			classes: "bg round",
			round: true,
			items: [
				expandMenuItem
			]
		});	
	}

	buildAddToDeckMenu(deck: Deck, cards: Card[]) {
		this.addToDeckMenuItem.menu.items.push(new MenuItem({
			text: deck.name,
			click: () => {
				this.itemsHeader.menu.clearActive();
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
	
	buildFooterMenu() {
		
		// Build version menu items
		let versionItems: MenuItem[] = [];
		if (this.card && this.card.alternate_printings) {
			this.card.alternate_printings.forEach(printing => {
				versionItems.push(new MenuItem({
					text: printing.set_name,
					route: printing.route,
					price: printing.price,
					symbol: printing.set_symbol,
					click: () => {
						this.footerMenu.clearActive();
					}
				}));
			});
		}

		// Build footer menu
		this.footerMenu = new Menu({
			clearActiveClickOutside: true,
			size: Size.small,
			classes: "round-large",
			maxWidth: "235px",
			horizontal: true,
		});

		// Version menu
		this.footerMenu.items = [
			new MenuItem({
				text: this.card.set_name,
				symbol: this.card.set_symbol,
				price: this.card.price,
				classes: "box",
				menu: new Menu({
					maxHeight: "300px",
					maxWidth: "100%",
					classes: "round anchor-bottom anchor-right",
					items: versionItems,
					search: this.card.alternate_printings.length > 20
				})
			})
		];
	}

}