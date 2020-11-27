import { Component, OnInit, Input } from '@angular/core';
import { ProgressBar } from './progress-bar';

@Component({
	selector: 'mb-progress-bar',
	templateUrl: 'progress-bar.component.html',
	styleUrls: ['./progress-bar.component.scss']
})

export class ProgressBarComponent implements OnInit {

	@Input() progressBar: ProgressBar;

	constructor() { }

	ngOnInit() { }
}