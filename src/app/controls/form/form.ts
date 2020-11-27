import { MBFormGroup } from './form-group/form-group';
import { FormGroup } from '@angular/forms';

export class MBForm {
	title: string;
	groups: MBFormGroup[];
	formGroup: FormGroup;

    constructor(init?:Partial<MBForm>) {
		Object.assign(this, init);
	}
}