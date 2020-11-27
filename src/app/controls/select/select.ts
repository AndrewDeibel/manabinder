export class Select {
	label: string;
	value: string;
	options: SelectOption[] = [];
	optionGroups: SelectOptionGroup[] = [];
	classes: string;
	change: (value: string) => void;
	_change: (value: string) => void;

    public constructor(init?:Partial<Select>) {
		Object.assign(this, init);
    }
}
export class SelectOption {
	text: string;
	value: string;
	selected: boolean;

    public constructor(init?:Partial<SelectOption>) {
        Object.assign(this, init);
    }
}
export class SelectOptionGroup {
	label: string;
	options: SelectOption[] = [];

    public constructor(init?:Partial<SelectOptionGroup>) {
        Object.assign(this, init);
    }
}