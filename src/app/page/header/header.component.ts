import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { User } from '@app/models/user';
import { Menu, MenuItem } from '@app/controls/menu';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Icons } from '@app/models/icons';

@Component({
	selector: 'mb-header',
	templateUrl: './header.component.html',
	styleUrls: ['./header.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class HeaderComponent implements OnInit {
	
	user: User;
	menuLogin: Menu;

	constructor(private authenticationService: AuthenticationService) { }

	ngOnInit(): void {
		this.menuLogin = new Menu({
			classes: "round bg",
			horizontal: true,
			items: [
				new MenuItem({
					icon: Icons.signIn,
					route: "signin",
					text: "Sign In"
				})
			]
		})
	}

	get signedIn(): boolean {
		return this.authenticationService.currentUserValue != null;
	}
	
}