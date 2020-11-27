import { Component, OnInit, Input } from '@angular/core';
import { ItemsHeader } from './items-header';

@Component({
	selector: 'mb-items-header',
	templateUrl: 'items-header.component.html',
	styleUrls: ['./items-header.component.scss']
})

export class ItemsHeaderComponent implements OnInit {

	@Input() itemsHeader: ItemsHeader;

	constructor() { }

	ngOnInit() {
		this.setupDefaultControlAttributes();
	}

	setupDefaultControlAttributes() {
		if (this.itemsHeader.menu) { 
			this.itemsHeader.menu.classes = "round border-primary shadow-light";
			this.itemsHeader.menu.horizontal = true;
		}
	}
}