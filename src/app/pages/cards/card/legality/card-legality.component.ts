import { Component, OnInit, Input } from '@angular/core';
import { Card, CardLegality } from '../card';
import { CardsService } from '../../cards.service';
import { ActivatedRoute } from '@angular/router';
import { Tag } from '@app/controls/tag';

@Component({
	selector: 'mb-card-legality',
	templateUrl: 'card-legality.component.html',
	styleUrls: ['./card-legality.component.scss']
})

export class CardLegalityComponent implements OnInit {

	@Input() card: Card;
	loading: boolean = false;
	id: number;

	constructor(
		private cardsService: CardsService,
		private route: ActivatedRoute) { }

	ngOnInit() {
		this.card = this.cardsService.getCardValue();
	}

	buildTag(legality: CardLegality) {
		return new Tag({
			text: legality.legality == "not_legal" ? "not legal" : legality.legality,
			classes: legality.legality
		})
	}
}