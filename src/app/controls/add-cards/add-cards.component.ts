import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { AddCards } from './add-cards';
import { CardsService } from '@app/pages/cards/cards.service';
import { Card } from '@app/pages/cards/card/card';
import { DecksService } from '@app/pages/decks/decks.service';
import { CollectionCardsService } from '@app/pages/collection/collection-cards/collection-cards.service';
import { CollectionDecksService } from '@app/pages/collection/collection-decks/collection-decks.service';
import { Button } from '../button';
import { Icons } from '@app/models/icons';

@Component({
	selector: 'mb-add-cards',
	templateUrl: 'add-cards.component.html',
	styleUrls: ['./add-cards.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class AddCardsComponent implements OnInit {

	@Output() cardAdded: EventEmitter<boolean> = new EventEmitter();
	@Input() addCards: AddCards;

	buttonOpen: Button;
	buttonClose: Button;

	constructor(private cardsService: CardsService,
		private collectionCardsService: CollectionCardsService,
		private decksService: DecksService,
		private collectionDecksService: CollectionDecksService) { }

	ngOnInit() {

		// Response search
		this.cardsService.searchCardsObservable().subscribe(result => {
			if (result) {
				this.addCards.cards = result.cards;
			}
		});

		// Response add
		this.decksService.addDeckCardsObservable().subscribe(result => {
			if (result) {
				this.cardAdded.emit(result);
			}
		});

		this.addCards.textboxSearch.keydownEnter = () => {
			this.search();
		}
		this.addCards.textboxSearch.clickIcon = () => {
			this.search();
		}

		this.buildControls();
	}

	buildControls() {
		var _this = this;
		this.buttonOpen = new Button({
			text: "Add Cards",
			icon: Icons.plus,
			classes: "justify-center",
			click: () => {
				_this.addCards.active = true;
			}
		});
		this.buttonClose = new Button({
			icon: Icons.close,
			click: () => {
				_this.addCards.active = false;
			}
		});
	}

	clickResult(event: MouseEvent, card: Card) {
		event.stopPropagation();

		// Response added to collection
		this.collectionCardsService.addCollectionCardsObservable().subscribe(res => {
			if (res) {

				// Add to deck
				this.decksService.addDeckCards({
					user_cards: JSON.stringify(res),
					user_deck_id: this.addCards.user_deck_id
				});
			}
		});

		// Quantity to add
		let cards: Card[] = [];
		for (let i = 0; i < +this.addCards.textboxQuantity.value; i++) {
			cards.push(card);
		}

		// Add to collection
		this.collectionCardsService.addCollectionCards(cards);

		this.addCards.textboxQuantity.value = "1";
	}

	search() {
		if (this.addCards.textboxSearch.value.length > 0) {
			this.cardsService.searchCards({
				language_id: 1,
				page: 1,
				page_size: 200,
				query: this.addCards.textboxSearch.value,
				sort_by: "cards",
			});
		}
		else {
			this.clear();
		}
	}

	clear() {
		this.addCards.cards = [];
	}
}