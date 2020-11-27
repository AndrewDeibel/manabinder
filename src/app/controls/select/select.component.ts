import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { Select } from './select';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
	selector: 'mb-select',
	templateUrl: './select.component.html',
	styleUrls: ['./select.component.scss'],

	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => SelectComponent),
			multi: true
		}
	]
})

export class SelectComponent implements ControlValueAccessor {

	constructor() { }

	onChange: any = () => { };
	onTouched: any = () => { };
	registerOnChange(fn) { this.onChange = fn }
	registerOnTouched(fn) { this.onTouched = fn }
	writeValue(_value) { this.value = _value; }
	get value() { return this.select.value; }
	set value(_value) {
		this.select.value = _value;
		this.select.options.forEach(option => {
			option.selected = option.value === _value;
		});
		this.select.optionGroups.forEach(group => {
			group.options.forEach(option => {
				option.selected = option.value === _value;
			});
		});
		this.onChange(_value);
		this.onTouched();
	}

	@Input() select: Select;

	change() {
		if (this.select.change) {
			this.select.change(this.select.value);
		}
		if (this.select._change) {
			this.select._change(this.select.value);
		}
	}

}
