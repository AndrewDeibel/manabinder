import { Component, OnInit, Input } from '@angular/core';
import { Card } from '../card';
import { CardsService } from '../../cards.service';
import { ActivatedRoute } from '@angular/router';
import { Tag } from '@app/controls/tag';

@Component({
	selector: 'mb-card-details',
	templateUrl: 'card-details.component.html',
	styleUrls: ['./card-details.component.scss']
})

export class CardDetailsComponent implements OnInit {

	card: Card;
	loading: boolean = false;
	id: number;
	tagReserved: Tag;

	constructor(
		private cardsService: CardsService,
		private route: ActivatedRoute) { }

	ngOnInit() {

		// Response from request
		this.cardsService.cardObservable().subscribe(card => {
			if (card) {
				this.loading = false;
				this.card = card;
			}
		});

		this.tagReserved = new Tag({
			text: "Reserved List",
			classes: "primary"
		});
		
		// // Get id from route
		// this.route.parent.params.subscribe(params => {
		// 	this.id = +params["id"]

		// 	// Request card from service
		// 	this.cardsService.getCard(this.id);

		// });
	}
}