import { Component, OnInit } from '@angular/core';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { Binders } from '@app/pages/binders/binders';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { CollectionBindersService } from './collection-binders.service';
import { Icons } from '@app/models/icons';
import { Button } from '@app/controls/button';
import { LoaderService } from '@app/controls';

@AutoUnsubscribe()
@Component({
	selector: 'mb-collection-binders',
	templateUrl: 'collection-binders.component.html'
})

export class CollectionBindersComponent implements OnInit {

	binders: Binders;

	constructor(
		private loaderService: LoaderService,
		private authenticationService: AuthenticationService,
		private collectionBindersService: CollectionBindersService
	) { }

	ngOnDestroy() { }
	ngOnInit() {

		this.binders = new Binders();
		this.binders.outputGetItems = true;
		this.binders.items.header.icon = Icons.binders,
		this.binders.items.header.title = "Collection";
		this.binders.items.filter.textboxSearch.placeholder = "Search collection binders...";
		this.binders.items.noResults = "No binders found";
		this.binders.items.filter.sortBy = "created_at";
		this.binders.items.buttonNoResults = new Button({
			text: "Create Binder",
			icon: Icons.plus,
			route: "/binders/new"
		});
		this.binders.items.header.button = new Button({
			text: "Create Binder",
			icon: Icons.plus,
			route: "/binders/new"
		});

		// Response get binders
		this.collectionBindersService.searchBindersObservable().subscribe(res => {
			if (res) {
				this.loaderService.hide();
				this.binders.items.items = res.binders;
				this.binders.items.footer.totalPages = res.total_pages;
				this.binders.items.header.subtitle = `binders: ${res.total_results}`;
			}
		});
	}

	getItems() {
		this.loaderService.show();
		this.collectionBindersService.searchBinders({
			page: this.binders.items.footer.page,
			page_size: this.binders.items.footer.pageSize,
			query: this.binders.items.filter.query,
			sort_by: this.binders.items.filter.sortBy,
			sort_direction: this.binders.items.filter.sortDirection,
			user_id: this.authenticationService.currentUserValue.id
		});
	}
}