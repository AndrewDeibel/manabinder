import { Component, OnInit, Input } from '@angular/core';
import { Set } from '../../set/set';

@Component({
	selector: 'mb-set-item-list',
	templateUrl: 'set-item-list.component.html',
	styleUrls: ['./set-item-list.component.scss']
})

export class SetItemListComponent implements OnInit {

	@Input() set: Set;
	
	constructor() { }

	ngOnInit() { }
}