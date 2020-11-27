import { Card } from '@app/pages/cards';

export class ScannerList {
	cards: Card[] = [];
	date_create: Date;

    constructor(init?:Partial<ScannerList>) {
		Object.assign(this, init);
	}
}