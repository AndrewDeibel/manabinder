import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'mb-footer',
	templateUrl: './footer.component.html',
	styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {

	year: number;

	ngOnInit() {
		this.year = (new Date()).getFullYear();
	}

}