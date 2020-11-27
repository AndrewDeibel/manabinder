import { Component, OnInit, Input, forwardRef } from '@angular/core';
import { Toggle } from './toggle';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
	selector: 'mb-toggle',
	templateUrl: 'toggle.component.html',
	styleUrls: ['./toggle.component.scss'],

	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => ToggleComponent),
			multi: true
		}
	]
})

export class ToggleComponent implements ControlValueAccessor {

	onChange: any = () => {};
	onTouched: any = () => {};
	registerOnChange(fn) { this.onChange = fn }
	registerOnTouched(fn) { this.onTouched = fn }
	writeValue(_value) { this.value = _value; }
	get value() { return this.toggle.checked; }
	set value(_value) {
		this.toggle.checked = _value;
		this.onChange(_value);
		this.onTouched();
	}

	@Input() toggle: Toggle;

	constructor() { }

	ngOnInit() { }

	change() {
		
	}
}