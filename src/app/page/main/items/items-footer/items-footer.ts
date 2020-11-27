import { Select } from '@app/controls/select';
import { Button } from '@app/controls/button';
import { Textbox } from '@app/controls/textbox';

export class ItemsFooter {

	// Values
	page: number = 1;
	pageSize: number = 12;
	totalPages: number;

	// Controls
	selectPageSize: Select = new Select();
	buttonPrev: Button = new Button();
	buttonNext: Button = new Button();
	textboxPage: Textbox = new Textbox();

	_this: any;
	getItems: (_this: any) => void;

    constructor(init?:Partial<ItemsFooter>) {
		Object.assign(this, init);
	}
}