import { Items } from '@app/page/main/items/items';

export class Cards {
	items: Items = new Items();

	hidePaging: boolean = false;
	totalCards: number;
	art: boolean;
	isDefault: boolean = false;
	getCardsOnInit: boolean = true;

    constructor(init?:Partial<Cards>) {
		Object.assign(this, init);
	}
}