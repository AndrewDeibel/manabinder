import { Card } from '@app/pages/cards/card';

export class Binder {
	id: number;
    name: string;
    image: string;
	created_at: Date;
	updated_at: Date;
	public: boolean;
	trades: boolean;
	metadata: string;
	cards: Card[];
	route: string;
	constructor(init?:Partial<Binder>) {
		Object.assign(this, init);

		this.route = `/binders/${this.id}`;

		if (this.cards.length) {

			// Default image is first card
			this.image = this.cards[0].userCard.card.images.art_crop;
		}
	}
}