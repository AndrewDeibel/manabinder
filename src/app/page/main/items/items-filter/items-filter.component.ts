import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { ItemsFilter, ItemDisplayType } from './items-filter';
import { Menu, MenuItem } from '@app/controls/menu';
import { ActivatedRoute, Router } from '@angular/router';
import { Icons } from '@app/models/icons';

@Component({
	selector: 'mb-items-filter',
	templateUrl: 'items-filter.component.html',
	styleUrls: ['./items-filter.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class ItemsFilterComponent implements OnInit {

	@Input() itemsFilter: ItemsFilter;
	@Output() outputGetItems: EventEmitter<string> = new EventEmitter;
	@Output() outputDisplayModeChanged: EventEmitter<ItemDisplayType> = new EventEmitter;

	constructor(
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {
		this.setupDefaultControls();
	}

	setupDefaultControls() {

		// Search
		this.itemsFilter.textboxSearch.keydownEnter = value => {
			this.itemsFilter.query = value;
			this.outputGetItems.emit();
		}
		this.itemsFilter.textboxSearch.clickIcon = value => {
			this.itemsFilter.query = value;
			this.outputGetItems.emit();
		}

		// Sort by
		this.itemsFilter.selectSortBy.change = value => {
			this.itemsFilter.sortBy = value;
			this.outputGetItems.emit();
		}

		// Sort direction
		this.itemsFilter.selectSortDirection.change = value => {
			this.itemsFilter.sortDirection = value;
			this.outputGetItems.emit();
		}

		// Display modes
		this.itemsFilter.menuDisplayMode = new Menu({
			clearActiveClickOutside: false,
			horizontal: true,
			classes: "round border shadow-light",
		});
		// Visual
		if (this.itemsFilter.showVisualDisplayMode) {
			this.itemsFilter.menuItemVisualDisplayMode = new MenuItem({
				text: "Visual",
				icon: Icons.cards,
				active: this.itemsFilter.displayMode == ItemDisplayType.visual,
				click: () => {
					this.setDisplayMode(ItemDisplayType.visual);
				}
			});
			this.itemsFilter.menuDisplayMode.items.push(this.itemsFilter.menuItemVisualDisplayMode);
		}
		// Simple
		if (this.itemsFilter.showSimpleDisplayMode) {
			this.itemsFilter.menuItemSimpleDisplayMode = new MenuItem({
				text: "Simple",
				icon: Icons.lineColumns,
				active: this.itemsFilter.displayMode == ItemDisplayType.simple,
				click: () => {
					this.setDisplayMode(ItemDisplayType.simple);
				}
			});
			this.itemsFilter.menuDisplayMode.items.push(this.itemsFilter.menuItemSimpleDisplayMode);
		}
		// Grid
		if (this.itemsFilter.showGridDisplayMode) {
			this.itemsFilter.menuItemGridDisplayMode = new MenuItem({
				text: "Grid",
				icon: Icons.grid,
				active: this.itemsFilter.displayMode == ItemDisplayType.grid,
				click: () => {
					this.setDisplayMode(ItemDisplayType.grid);
				}
			});
			this.itemsFilter.menuDisplayMode.items.push(this.itemsFilter.menuItemGridDisplayMode);
		}
		// List
		if (this.itemsFilter.showListDisplayMode) { 
			this.itemsFilter.menuItemListDisplayMode = new MenuItem({
				text: "List",
				icon: Icons.list,
				active: this.itemsFilter.displayMode == ItemDisplayType.list,
				click: () => {
					this.setDisplayMode(ItemDisplayType.list);
				}
			});
			this.itemsFilter.menuDisplayMode.items.push(this.itemsFilter.menuItemListDisplayMode);
		}
	}

	setDisplayMode(type: ItemDisplayType) {
		this.outputDisplayModeChanged.emit(type);
		this.itemsFilter.setDisplayMode(type);
		this.itemsFilter.displayMode = type;
	}
}