import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Binder } from './binder/binder';
import { Textbox } from '@app/controls/textbox';
import { Menu, MenuItem } from '@app/controls/menu';
import { Binders } from './binders';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../auth/auth.service';
import { CollectionBindersService } from '../collection/collection-binders/collection-binders.service';
import { Icons } from '@app/models';
import { Button, LoaderService } from '@app/controls';
import { BindersService } from './binders.service';

@Component({
    selector: 'mb-binders',
	templateUrl: './binders.component.html',
	styleUrls: ['./binders.component.scss']
})

export class BindersComponent implements OnInit {

	@Input() binders: Binders;
	@Output() outputGetItems: EventEmitter<void> = new EventEmitter;

	constructor(
		private titleService: Title,
		private loaderService: LoaderService,
		private bindersService: BindersService,
		private collectionBindersService: CollectionBindersService,
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService) {
		
	}

	ngOnInit(): void {

		// Init
		if (!this.binders) {
			this.binders = new Binders();
			this.binders.items.header.title = "All Binders",
			this.binders.items.filter.sortBy = "created_at",
			this.binders.items.filter.showListDisplayMode = false;
			this.binders.items.header.icon = Icons.binders;
			this.binders.items.filter.textboxSearch.placeholder = "Search binders...";
			this.binders.items.noResults = "No binders found";
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
		}

		// Response search binders
		this.bindersService.searchBindersObservable().subscribe(res => {
			if (res) {
				this.loaderService.hide();
				this.binders.items.items = res.binders;
				this.binders.items.footer.totalPages = res.total_pages;
				this.binders.items.header.subtitle = `binders: ${res.total_results}`;
			}
		});
	}

	getItems() {
		// Get items controlled by parent
		if (this.binders.outputGetItems) {
			this.outputGetItems.emit();
		}
		else {
			this.loaderService.show();
	
			this.bindersService.searchBinders({
				page: this.binders.items.footer.page,
				page_size: this.binders.items.footer.pageSize,
				query: this.binders.items.filter.query,
				sort_by: this.binders.items.filter.sortBy,
				sort_direction: this.binders.items.filter.sortDirection
			});
		}
	}

}