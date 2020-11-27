import { Component, OnInit, Input } from '@angular/core';
import { Tag } from './tag';

@Component({
	selector: 'mb-tag',
	templateUrl: 'tag.component.html',
	styleUrls: ['./tag.component.scss']
})

export class TagComponent implements OnInit {

	@Input() tag: Tag;

	constructor() { }

	ngOnInit() { }
}