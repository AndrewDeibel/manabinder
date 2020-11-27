import { MBForm } from '../form';
import { Menu, MenuItem } from '../menu';
import { Icons } from '@app/models/icons';

export class Wizard {
	title: string;
	subtitle: string;
	icon: Icons;
	steps: WizardStep[] = [];
	menu: Menu;

    constructor(init?:Partial<Wizard>) {
		Object.assign(this, init);

		this.menu = new Menu();

		this.steps.forEach(step => {
			this.menu.items.push(new MenuItem({
				text: step.title
			}));
		});
	}
}

export class WizardStep {
	title: string;
	subtitle: string;
	icon: Icons;
	form: MBForm;
	index: number;

    constructor(init?:Partial<WizardStep>) {
		Object.assign(this, init);
	}
}