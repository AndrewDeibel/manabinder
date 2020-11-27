import { Size } from '@app/models/size';

export enum ButtonType {
	button = "button",
	submit = "submit"
}

export class Button {
    text?: string;
    icon?: string;
    href?: string;
	route?: string;
    disabled: boolean;
    primary: boolean = true;
	size: Size = Size.medium;
	classes: string;
	width: string;
	type: ButtonType = ButtonType.button;

    public click: () => void;

    public constructor(init?:Partial<Button>) {
		Object.assign(this, init);
	}
}