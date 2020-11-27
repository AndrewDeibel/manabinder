import { Component, OnInit, Input } from '@angular/core';
import { Menu, MenuItem } from './menu';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
	selector: 'mb-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss']
})

export class MenuComponent implements OnInit {

	@Input() menu: Menu = new Menu();

	constructor(private router: Router,
		private route: ActivatedRoute) { }

	ngOnInit(): void {

	}

	onItemClick(item: MenuItem, event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		
		if (item.route) {
			this.router.navigate([item.route], {relativeTo: this.route});
		}

		// item.click is often clearActive, so save current active state first
		let active = item.active;
		if (item.click) {
			item.click(event);
		}
        if (item.menu) {
			item.active = !active;
		}
	}

	getExpandIcon(item: MenuItem) {
		if (item.menu.classes && item.menu.classes.includes("anchor-bottom")) {
			return "caret-up"
		}
		else {
			return "caret-down"
		}
	}

	clickOutside() {
		if (this.menu.clearActiveClickOutside) {
			this.menu.clearActive();
		}
	}

}