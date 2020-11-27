import { Items } from '@app/page/main/items/items';

export class Decks {
	items: Items = new Items();
	outputGetItems: boolean = false;
    constructor(init?:Partial<Decks>) {
		Object.assign(this, init);
	}
}