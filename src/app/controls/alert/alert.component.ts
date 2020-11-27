import { Component, OnInit, Input } from '@angular/core';
import { Alert, AlertType } from './alert';

@Component({
	selector: 'mb-alert',
	templateUrl: 'alert.component.html',
	styleUrls: ['./alert.component.scss']
})

export class AlertComponent implements OnInit {

	@Input() alert: Alert;

	constructor() { }

	ngOnInit() { }
}