import { Items } from '@app/page/main';

export class Binders {
	items: Items = new Items();
	totalBinders: number;
	outputGetItems: boolean = false;

	constructor(init?:Partial<Binders>) {
		Object.assign(this, init);
	}
}