import { Component, OnInit, Input, IterableDiffers } from '@angular/core';
import { Card, UserCard, CardGroup, CardType } from '@app/pages/cards/card/card';
import { Menu } from '@app/controls';
import { Icons } from '@app/models';

@Component({
	selector: 'mb-items-visual',
	templateUrl: 'items-visual.component.html',
	styleUrls: ['./items-visual.component.scss']
})

export class ItemsVisualComponent implements OnInit {

	@Input() items: UserCard[];
	cards: Card[];
	cardsCounted: Card[] = [];

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
	}

	groupByName() {
		//let _cards: Card[] = Object.assign([], this.cards);
		//this.cards = [];
		this.cards.forEach(card => {

			// If no card names match
			if (!this.cardsCounted.some(_card => {
				return _card.name === card.name;
			})) {

				// Add card
				this.cardsCounted.push(card);
			}
			else {

				// Increment count
				this.cardsCounted.filter(_card => {
					return _card.name === card.name
				}).forEach(_card => {
					_card.count++;
				});
			}
		});
	}

	sortByName() {
		this.cardGroups.forEach(group => {
			group.cards.sort((a, b) => a.name.localeCompare(b.name));
		});
	}

	groupByType() {
		this.cardsCounted.forEach(card => {
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
		
		// Calculate group counts
		this.cardGroups.forEach(group => {
			let _count = 0;
			group.cards.forEach(card => {
				_count += card.count;
			});
			group.count = _count;
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
				icon: this.getCardGroupIcon(cardType),
				cards: [
					card
				],
			}))
		}
	}

	getCardGroupIcon(cardType: CardType): Icons {
		switch (cardType) {
			case CardType.creature: return Icons.pawClaws;
			case CardType.artifact: return Icons.trophy;
			case CardType.instant: return Icons.bolt;
			case CardType.sorcery: return Icons.magic;
			case CardType.land: return Icons.mountains;
			case CardType.enchantment: return Icons.eclipse;
			case CardType.planeswalker: return Icons.hoodCloak;
		}
	}
}