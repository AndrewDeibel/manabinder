import { ItemsHeader } from './items-header/items-header';
import { ItemsFooter } from './items-footer/items-footer';
import { ItemsFilter, ItemDisplayType } from './items-filter/items-filter';
import { Button } from '@app/controls/button/button';

export class Items {
	showHeader: boolean = true;
	showFooter: boolean = true;
	header: ItemsHeader = new ItemsHeader();
	filter: ItemsFilter = new ItemsFilter();
	footer: ItemsFooter = new ItemsFooter();

	itemDisplayType: ItemDisplayType = ItemDisplayType.grid;
	items: any[] = [];
	getItems: (_this: any) => void;

	_this: any;

	buttonNoResults: Button;
	noResults: string = "No items found";

    constructor(init?:Partial<Items>) {
		Object.assign(this, init);
		this.header.getItems = this.getItems;
		this.footer.getItems = this.getItems;
		this.header._this = this._this;
		this.footer._this = this._this;
	}
}