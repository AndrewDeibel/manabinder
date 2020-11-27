import { Component, OnInit } from '@angular/core';
import { Items, } from '@app/page/main';
import { SetsService } from './sets.service';
import { SelectOptionGroup, SelectOption } from '@app/controls/select';
import { Title } from '@angular/platform-browser';
import { LoaderService } from '@app/controls';

@Component({
	selector: 'mb-sets',
	templateUrl: './sets.component.html'
})

export class SetsComponent implements OnInit {

	items: Items;
	
	constructor(
		private loaderService: LoaderService,
		private titleService: Title,
		private setsService: SetsService) { }

	ngOnInit(): void {

		// Init
		this.items = new Items();
		this.items.header.title = "Sets";
		this.items.header.symbol = "/assets/symbols/judgepromo.svg";

		this.setupControls();

		// Response all sets
		this.setsService.allSetsObservable().subscribe(res => {
			if (res) {
				this.loaderService.hide();
				this.items.footer.totalPages = res.total_pages;
				this.items.items = res.sets;
				this.items.header.subtitle = `total: ${res.total_results}`;
				this.titleService.setTitle(`Mana Binder: ${this.items.header.title}`);
			}
		});
	}

	setupControls() {
		// Search
		this.items.filter.textboxSearch.placeholder = "Search sets...";
		// Sort by
		this.items.filter.selectSortBy.optionGroups = [
			new SelectOptionGroup({
				label: "Sort By",
				options: [
					new SelectOption({
						text: "Release Date",
						value: "release_date",
						selected: true,
					}),
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
		this.items.filter.showListDisplayMode = false;
		this.items.filter.sortBy = "release_date";
		this.items.filter.selectSortBy.value = "release_date";
		// Page size
		this.items.footer.pageSize = 100;
	}

	getSets() {
		this.loaderService.show();
		this.setsService.allSets({
			page: this.items.footer.page,
			page_size: this.items.footer.pageSize,
			sort_by: this.items.filter.sortBy,
			sort_direction: this.items.filter.sortDirection,
			query: this.items.filter.query
		});
	}

}