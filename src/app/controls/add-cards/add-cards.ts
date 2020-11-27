import { Textbox } from '@app/controls/textbox';
import { Checkbox } from '@app/controls/checkbox';
import { Icons } from '@app/models/icons';
import { Card } from '@app/pages/cards/card/card';

export class AddCards {
	user_deck_id: number;
	active: boolean = false;
	cards: Card[] = [];

	// Controls
	textboxSearch: Textbox;
	textboxQuantity: Textbox;
	checkboxFoil: Checkbox;

    constructor(init?:Partial<AddCards>) {
		Object.assign(this, init);
		this.setupControls();
	}

	setupControls() {
		this.textboxSearch = new Textbox({
			icon: Icons.search,
			placeholder: "Search cards to add..."
		});
		this.textboxQuantity = new Textbox({
			value: "1",
			type: "number",
			min: 0,
			max: 25
		});
	}
}