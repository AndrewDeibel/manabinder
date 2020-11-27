import { Component, OnInit } from '@angular/core';
import { Menu, MenuItem } from '@app/controls/menu';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Icons } from '@app/models/icons';

@Component({
	selector: '[mb-profile]',
	templateUrl: './profile.component.html'
})

export class ProfileComponent implements OnInit {
	menu: Menu;

	constructor(private authenticationService: AuthenticationService) { }

	ngOnInit(): void {
		this.menu = new Menu({
			classes: "round",
			clearActiveClickOutside: true,
			horizontal: true,
			items: [
				new MenuItem({
					text: this.authenticationService.currentUserValue.username,
					icon: Icons.user,
					menu: new Menu({
						classes: "anchor-right",
						items: [
							// new MenuItem({
							// 	text: "Dashboard",
							// 	icon: Icons.dashboard,
							// 	route: "dashboard",
							// 	click: () => {
							// 		this.menu.clearActive();
							// 	}
							// }),
							// new MenuItem({
							// 	text: "Profile",
							// 	icon: Icons.user,
							// 	route: "profile",
							// 	click: () => {
							// 		this.menu.clearActive();
							// 	}
							// }),
							// new MenuItem({
							// 	text: "Settings",
							// 	icon: Icons.settings,
							// 	route: "settings",
							// 	click: () => {
							// 		this.menu.clearActive();
							// 	}
							// }),
							// new MenuItem({
							// 	text: "Become a Donor",
							// 	icon: Icons.donate,
							// 	route: "patreon",
							// 	click: () => {
							// 		this.menu.clearActive();
							// 	}
							// }),
							new MenuItem({
								text: "Sign Out",
								icon: Icons.signOut,
								click: () => {
									this.authenticationService.logout();
								}
							}),
						]
					})
				}),
			]
		});
	}

}