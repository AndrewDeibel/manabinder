import { Component, OnInit, Input } from '@angular/core';
import { MBForm } from './form';
import { FormGroup } from '@angular/forms';

@Component({
	selector: 'mb-form',
	templateUrl: 'form.component.html'
})

export class FormComponent implements OnInit {

	@Input() form: MBForm;

	constructor() { }

	ngOnInit() { }

	onSubmit(formGroup: FormGroup) {
		window.alert('Valid: ' + formGroup.valid);
	}
}