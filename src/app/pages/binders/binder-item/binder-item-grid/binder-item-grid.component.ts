import { Component, Input, OnInit } from '@angular/core';
import { Binder } from '../../binder/binder';

@Component({
    selector: 'mb-binder-item-grid',
	templateUrl: './binder-item-grid.component.html',
	styleUrls: ['./binder-item-grid.component.scss']
})

export class BinderItemGridComponent implements OnInit {

	@Input() binder: Binder;

    constructor() {}

    ngOnInit(): void {

    }

}