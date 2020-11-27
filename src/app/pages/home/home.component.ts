import { Component, OnInit } from '@angular/core';
import { version } from '@app/../../package.json';
import { Alert, AlertType } from '@app/controls';

@Component({
	selector: 'mb-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

	public version: string = version;
	alert: Alert;

	constructor() { }
	
	ngOnInit(): void {
		this.alert = new Alert({
			type: AlertType.warning,
			message: "<b>Under Development:</b> Please note that Mana Binder is still under development, you should expect to find some issues."
		});
	}

}