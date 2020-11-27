import { Component, OnInit, Input } from '@angular/core';
import { Wizard } from './wizard';

@Component({
	selector: 'mb-wizard',
	templateUrl: 'wizard.component.html'
})

export class WizardComponent implements OnInit {

	@Input() wizard: Wizard;

	constructor() { }

	ngOnInit() { }
}