import { MBFormControl } from './form-control/form-control';

export class MBFormGroup {
	title: string;
	subtitle: string;
	controls: MBFormControl[];

    constructor(init?:Partial<MBFormGroup>) {
		Object.assign(this, init);
	}
}