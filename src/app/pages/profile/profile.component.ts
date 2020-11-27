import { Component, OnInit, Input } from '@angular/core';
import { Profile } from './pofile';

@Component({
	selector: 'app-profile',
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {

	@Input() profile: Profile;

	constructor() { }

	ngOnInit(): void {
	}

}