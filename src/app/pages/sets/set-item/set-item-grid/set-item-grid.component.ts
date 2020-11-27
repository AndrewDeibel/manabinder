import { Component, OnInit, Input } from '@angular/core';
import { Set } from '../../set/set';

@Component({
	selector: 'mb-set-item-grid',
	templateUrl: 'set-item-grid.component.html',
	styleUrls: ['./set-item-grid.component.scss']
})

export class SetItemGridComponent implements OnInit {

	@Input() set: Set;
	
	constructor() {}

	ngOnInit() {
	}
}