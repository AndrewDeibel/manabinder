export class MBFormControl {
	control: any;
	classes: string;

    constructor(init?:Partial<MBFormControl>) {
		Object.assign(this, init);
	}
}