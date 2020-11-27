import { Card } from '@app/pages/cards/card';

export class Artist {
	name: string;
	id: number;
	total_cards: number;
	latest_card: Card;
	route: string;

    constructor(init?:Partial<Artist>) {
		Object.assign(this, init);

		this.route = `/artists/${this.id}`;
	}
}