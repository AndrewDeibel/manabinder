import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Menu, MenuItem } from '@app/controls/menu';
import { Icons } from './models/icons';
import { AuthenticationService } from './pages/auth/auth.service';
import { LoaderService } from './controls';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {
	title = 'mana-binder';
	menu: Menu = new Menu();
	theme: string = "dark";
	showMenu: boolean = true;
	loading: boolean = false;
	menuItemTools: MenuItem;

	constructor(
		private cdRef: ChangeDetectorRef,
		private authenticationService: AuthenticationService,
		private loaderService: LoaderService) { }

	ngOnInit() {

		// Loader 
		this.loaderService.loading.asObservable().subscribe((loading: boolean) => {
			if (this.loading != loading) {
				this.loading = loading;
				this.cdRef.detectChanges();
			}
		});

		// Theme
		let body = document.getElementsByTagName('body')[0];
		body.classList.add('theme');
		body.classList.add('dark');

		this.menu.clearActiveClickOutside = true;
		this.menu.horizontal = true;
		this.menu.items.push(
			new MenuItem({
				text: "Cards",
				icon: Icons.cards,
				click: () => {
					this.menu.clearActive();
				},
				menu: new Menu({
					items: [
						new MenuItem({
							text: "Cards",
							icon: Icons.cards,
							route: "cards",
							click: () => {
								this.menu.clearActive();
							},
						}),
						new MenuItem({
							text: "Sets",
							icon: Icons.sets,
							route: "sets",
							click: () => {
								this.menu.clearActive();
							},
						}),
						new MenuItem({
							text: "Artists",
							icon: Icons.artists,
							route: "artists",
							click: () => {
								this.menu.clearActive();
							}
						})
					]
				})
			}),
			new MenuItem({
				text: "Decks",
				icon: Icons.deck,
				route: "decks",
				click: () => {
					this.menu.clearActive();
				}
			})
		)
		if (this.authenticationService.currentUserValue) {
			this.menu.items.push(
				new MenuItem({
					text: "Collection",
					icon: Icons.archive,
					click: () => {
						this.menu.clearActive();
					},
					menu: new Menu({
						items: [
							new MenuItem({
								text: "Cards",
								icon: Icons.cards,
								route: "collection/cards",
								click: () => {
									this.menu.clearActive();
								}
							}),
							new MenuItem({
								text: "Decks",
								icon: Icons.deck,
								route: "collection/decks",
								click: () => {
									this.menu.clearActive();
								}
							}),
							new MenuItem({
								text: "Binders",
								icon: Icons.binders,
								route: "collection/binders",
								click: () => {
									this.menu.clearActive();
								}
							}),
						]
					})
				}),
			);
		}
		this.menuItemTools = new MenuItem({
			text: "Tools",
			icon: Icons.toolbox,
			menu: new Menu({
				classes: "anchor-right",
			})
		});
		this.menu.items.push(
			this.menuItemTools
		);
		if (this.authenticationService.currentUserValue) {
			this.menuItemTools.menu.items.push(
				new MenuItem({
					text: "Scanner",
					icon: Icons.scanner,
					route: "scanner",
					click: () => {
						this.menu.clearActive();
					}
				}),
			)
		}
		this.menuItemTools.menu.items.push(
			new MenuItem({
				text: "Life Tracker",
				icon: Icons.heartbeat,
				route: "tracker",
				click: () => {
					this.menu.clearActive();
				}
			}),
		)
	}
}