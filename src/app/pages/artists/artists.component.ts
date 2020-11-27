import { Component, OnInit } from '@angular/core';
import { Items } from '@app/page/main';
import { ArtistsService } from './artists.service';
import { SelectOptionGroup, SelectOption } from '@app/controls/select';
import { Icons } from '@app/models/icons';
import { Title } from '@angular/platform-browser';
import { LoaderService } from '@app/controls';

@Component({
	selector: 'mb-artists',
	templateUrl: './artists.component.html',
})
export class ArtistsComponent implements OnInit {

	items: Items;

	constructor(
		private loaderService: LoaderService,
		private titleService: Title,
		private artistsService: ArtistsService) { }

	ngOnInit(): void {

		// Init
		this.items = new Items();
		this.items.header.title = "Artists";
		this.titleService.setTitle(`Mana Binder: ${this.items.header.title}`);
		this.items.header.icon = Icons.user;

		this.setupControls();

		// Response all artists
		this.artistsService.allArtistsObservable().subscribe(res => {
			if (res) {
				this.loaderService.hide();
				this.items.footer.totalPages = res.total_pages;
				this.items.items = res.artists;
				this.items.header.subtitle = `total: ${res.total_results}`;
			}
		});
	}

	setupControls() {
		// Search
		this.items.filter.textboxSearch.placeholder = "Search artists...";
		// Sort by
		this.items.filter.selectSortBy.optionGroups = [
			new SelectOptionGroup({
				label: "Sort By",
				options: [
					new SelectOption({
						text: "Name",
						value: "name"
					}),
					new SelectOption({
						text: "Total Cards",
						value: "total_cards"
					})
				]
			})
		];
		this.items.filter.sortBy = "name";
		this.items.filter.selectSortBy.value = "name";
		// Page size
		this.items.footer.pageSize = 24;
	}

	getArtists() {
		this.loaderService.show();
		this.artistsService.allArtists({
			page: this.items.footer.page,
			page_size: this.items.footer.pageSize,
			sort_by: this.items.filter.sortBy,
			sort_direction: this.items.filter.sortDirection,
			query: this.items.filter.query
		});
	}

}
