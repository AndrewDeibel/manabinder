export class Editor {
	label: string;
	value: string = "";

    constructor(init?:Partial<Editor>) {
		Object.assign(this, init);
	}
}