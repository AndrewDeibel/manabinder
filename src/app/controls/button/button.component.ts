import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Button } from './button';

@Component({
	selector: 'mb-button',
	templateUrl: './button.component.html',
	styleUrls: ['./button.component.scss']
})

export class ButtonComponent implements OnInit {

	@Input() button: Button;
	@Input() disabled: boolean;

	constructor() { }

	ngOnInit(): void {
		
	}

}