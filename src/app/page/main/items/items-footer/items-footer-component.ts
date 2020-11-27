import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ItemsFooter } from './items-footer';
import { SelectOptionGroup, SelectOption, Select } from '@app/controls/select';
import { Textbox } from '@app/controls/textbox';
import { Button } from '@app/controls/button';
import { ActivatedRoute, Router } from '@angular/router';
import { Icons } from '@app/models/icons';

@Component({
	selector: 'mb-items-footer',
	templateUrl: 'items-footer-component.html',
	styleUrls: ['./items-footer-component.scss']
})

export class ItemsFooterComponent implements OnInit {

	@Input() itemsFooter: ItemsFooter;

	@Output() outputGetItems: EventEmitter<void> = new EventEmitter;

	constructor(
		private route: ActivatedRoute,
		private router: Router) { }

	ngOnInit() {

		this.setupDefaultControls();
		this.setupDefaultControlAttributes();
	}

	setupDefaultControls() {

		// Page
		this.itemsFooter.textboxPage = new Textbox({
			value: this.itemsFooter.page.toString(),
			change: value => {
				this.itemsFooter.page = +value;
				this.outputGetItems.emit();
				this.scrollToTop();
			}
		});

		// Page size
		this.itemsFooter.selectPageSize = new Select({
			value: this.itemsFooter.pageSize.toString(),
			change: value => {
				this.itemsFooter.pageSize = +value;
				this.itemsFooter.page = 1;
				this.itemsFooter.textboxPage.value = this.itemsFooter.page.toString();
				this.outputGetItems.emit();
				this.scrollToTop();
			}
		});

		// Prev
		this.itemsFooter.buttonPrev = new Button({
			click: () => {
				this.itemsFooter.page--;
				this.itemsFooter.textboxPage.value = this.itemsFooter.page.toString();
				this.outputGetItems.emit();
				this.scrollToTop();
			}
		});

		// Next
		this.itemsFooter.buttonNext = new Button({
			click: () => {
				this.itemsFooter.page++;
				this.itemsFooter.textboxPage.value = this.itemsFooter.page.toString();
				this.outputGetItems.emit();
				this.scrollToTop();
			}
		});
	}

	setupDefaultControlAttributes() {

		// Prev/next
		this.itemsFooter.buttonPrev.icon = Icons.arrowLeft;
		this.itemsFooter.buttonNext.icon = Icons.arrowRight;

		// Page size
		this.itemsFooter.selectPageSize.optionGroups = [
			new SelectOptionGroup({
				label: "Page Size",
				options: [
					
					new SelectOption({
						text: "12",
						value: "12"
					}),
					new SelectOption({
						text: "24",
						value: "24"
					}),
					new SelectOption({
						text: "60",
						value: "60"
					}),
					new SelectOption({
						text: "100",
						value: "100"
					})
				]
			})
		];
		this.itemsFooter.selectPageSize.value = this.itemsFooter.pageSize.toString();

		// Page
		this.itemsFooter.textboxPage.type = "number";
		this.itemsFooter.textboxPage.min = 1;
		this.itemsFooter.textboxPage.width = 64;
	}

	scrollToTop() {
		window.scrollTo(0, 0);
	}

	isPrevDisabled() {
		return this.itemsFooter.page <= 1;
	}

	isNextDisabled() {
		return this.itemsFooter.page >= this.itemsFooter.totalPages;
	}
}