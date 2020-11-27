import { Component, OnInit, Input, IterableDiffers } from '@angular/core';
import { Card, UserCard, CardType, CardGroup } from '@app/pages/cards/card/card';

@Component({
	selector: 'mb-items-simple',
	templateUrl: 'items-simple.component.html',
	styleUrls: ['./items-simple.component.scss']
})

export class ItemsSimpleComponent implements OnInit {

	@Input() items: UserCard[];
	cards: Card[];
	cardsCounted: Card[];

	cardGroups: CardGroup[] = [];
	iterableDiffer;

	constructor(private iterableDiffers: IterableDiffers) {
		this.iterableDiffer = iterableDiffers.find([]).create(null);
	}

	ngDoCheck() {
		let changes = this.iterableDiffer.diff(this.items);
		if (changes) {
			this.mapCards();
		}
	}

	ngOnInit() {

	}

	mapCards() {
		this.cardsCounted = [];
		this.cardGroups = [];

		// Get cards from user cards
		this.cards = this.items.map(card => { return card.card });
		this.groupByName();
		this.groupByType();
		this.sortByName();
		this.calculateTotals();
	}

	calculateTotals() {
		this.cardGroups.forEach(group => {
			group.count = group.cards.length;
		});
	}

	groupByName() {
		let _cards: Card[] = Object.assign([], this.cards);
		this.cards = [];
		_cards.forEach(card => {

			// If no card names match
			if (!this.cards.some(_card => {
				return _card.name === card.name;
			})) {

				// Add card
				this.cards.push(card);
			}
			else {

				// Increment count
				this.cards.filter(_card => {
					return _card.name === card.name
				}).forEach(_card => {
					_card.count++;
				});
			}
		});
	}

	groupByType() {
		this.cards.forEach(card => {
			let noType: Card[] = [];
			if (card.type.length) {

				// Match on type
				if (card.type.includes(CardType.land)) {
					this.addToGroupByType(CardType.land, card);
				}
				if (card.type.includes(CardType.artifact)) {
					this.addToGroupByType(CardType.artifact, card);
				}
				if (card.type.includes(CardType.creature)) {
					this.addToGroupByType(CardType.creature, card);
				}
				if (card.type.includes(CardType.enchantment)) {
					this.addToGroupByType(CardType.enchantment, card);
				}
				if (card.type.includes(CardType.instant)) {
					this.addToGroupByType(CardType.instant, card);
				}
				if (card.type.includes(CardType.planeswalker)) {
					this.addToGroupByType(CardType.planeswalker, card);
				}
				if (card.type.includes(CardType.sorcery)) {
					this.addToGroupByType(CardType.sorcery, card);
				}
			}
			else {
				noType.push(card);
			}
		});
	}

	sortByName() {
		this.cardGroups.forEach(group => {
			group.cards.sort((a, b) => a.name.localeCompare(b.name));
		});
	}

	addToGroupByType(cardType: CardType, card: Card) {
		// Type group exists
		var existingGroup = this.cardGroups.filter(cardGroup => {
			return cardGroup.title.includes(cardType)
		});
		if (existingGroup.length) {
			existingGroup[0].cards.push(card);
		}
		// Create type group
		else {
			this.cardGroups.push(new CardGroup({
				title: cardType,
				cards: [
					card
				]
			}))
		}
	}
}