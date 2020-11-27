import { Menu } from '@app/controls/menu';
import { Tag } from '@app/controls/tag';
import { Icons } from '@app/models/icons';
import { Button } from '@app/controls/button';
import { Toggle } from '@app/controls/toggle';

export class ItemsHeader {
	title: string;
	subtitle: string;
	tags: Tag[] = [];
	symbol: string;
	symbolRarity: string;
	icon: Icons;
	price: number;
	menu: Menu;
	button: Button;
	toggle: Toggle;

	_this: any;
	getItems: (_this: any) => void;

    constructor(init?:Partial<ItemsHeader>) {
		Object.assign(this, init);
	}
}