import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from '@angular/core';
import { Textbox } from './textbox';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Alert } from '../alert';

@Component({
	selector: 'mb-textbox',
	templateUrl: './textbox.component.html',
	styleUrls: ['./textbox.component.scss'],

	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => TextboxComponent),
			multi: true
		}
	]
})

export class TextboxComponent implements ControlValueAccessor {

	onChange: any = () => {};
	onTouched: any = () => {};
	registerOnChange(fn) { this.onChange = fn }
	registerOnTouched(fn) { this.onTouched = fn }
	writeValue(_value) { this.value = _value; }
	get value() { return this.textbox.value; }
	set value(_value) {
		this.textbox.value = _value;
		this.onChange(_value);
		this.onTouched();
	}

	@Input() textbox: Textbox;
	@Input() alert: Alert;
	@Output() keydownEnter: EventEmitter<string> = new EventEmitter();
	@Output() clickIcon: EventEmitter<string> = new EventEmitter();

	constructor() { }

	_keydownEnter() {
		this.keydownEnter.emit(this.value);
		if (this.textbox.keydownEnter) {
			this.textbox.keydownEnter(this.value);
		}
	}

	_clickIcon() {
		this.clickIcon.emit(this.value);
		if (this.textbox.clickIcon) {
			this.textbox.clickIcon(this.value);
		}
	}

	_change() {
		if (this.textbox.change) {
			this.textbox.change(this.value);
		}
	}

	clear() {
		this.textbox.value = "";
		//textboxEl1.focus();
	}
	
	_colorPickerChange(value: string) {
		this.textbox.value = value;
		this._change();
	}

}
