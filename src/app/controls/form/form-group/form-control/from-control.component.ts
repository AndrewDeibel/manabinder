import { Component, OnInit, Input } from '@angular/core';
import { MBFormControl } from './form-control';
import { Textbox } from '@app/controls/textbox';
import { Editor } from '@app/controls/editor';
import { Textarea } from '@app/controls/textarea';
import { Select } from '@app/controls/select';
import { Checkbox } from '@app/controls/checkbox';
import { Toggle } from '@app/controls/toggle';

@Component({
	selector: 'mb-form-control',
	templateUrl: 'form-control.component.html'
})

export class FormControlComponent implements OnInit {

	@Input() mbFormControl: MBFormControl;
	
	constructor() { }

	ngOnInit() {
		
	}

	isTextbox() {
		return this.mbFormControl.control instanceof Textbox;
	}
	isTextarea() {
		return this.mbFormControl.control instanceof Textarea;
	}
	isSelect() {
		return this.mbFormControl.control instanceof Select;
	}
	isEditor() {
		return this.mbFormControl.control instanceof Editor;
	}
	isCheckbox() {
		return this.mbFormControl.control instanceof Checkbox;
	}
	isToggle() {
		return this.mbFormControl.control instanceof Toggle;
	}
}