import { Component, OnInit, Input } from '@angular/core';

@Component({
	selector: 'mb-loader',
	templateUrl: './loader.component.html',
	styleUrls: ['./loader.component.scss']
})

export class LoaderComponent implements OnInit {

	@Input() dark: boolean;
	@Input() active: boolean;

	constructor() { }

	ngOnInit(): void {

	}

}