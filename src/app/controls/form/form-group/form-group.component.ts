import { Component, OnInit, Input } from '@angular/core';
import { MBFormGroup } from './form-group';

@Component({
	selector: 'mb-form-group',
	templateUrl: 'form-group.component.html'
})

export class FormGroupComponent implements OnInit {

	@Input() mbFormGroup: MBFormGroup;

	constructor() { }

	ngOnInit() {
		
	}
}