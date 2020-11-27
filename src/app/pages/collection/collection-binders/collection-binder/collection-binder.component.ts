import { Component, OnInit } from '@angular/core';
import { Binder, BindersService } from '@app/pages/binders';
import { MBForm, Textbox, Toggle, Button, Checkbox, MBFormGroup, MBFormControl, Menu, MenuItem } from '@app/controls';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ItemsHeader } from '@app/page/main';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionBindersService } from '../collection-binders.service';
import { Icons } from '@app/models';

@Component({
	selector: 'mb-collection-binder',
	templateUrl: 'collection-binder.component.html'
})

export class CollectionBinderComponent implements OnInit {

	id: number;
	binder: Binder;
	form: MBForm;
	formGroup: FormGroup;
	header: ItemsHeader;
	textboxName: Textbox;
	togglePublic: Toggle;
	checkboxTrades: Checkbox;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder,
		private bindersService: BindersService,
		private collectionBindersService: CollectionBindersService
	) { }

	ngOnInit() {
		
		this.buildForm();

		this.header = new ItemsHeader({
			icon: Icons.binders,
			title: "Create New Binder",
			button: new Button({
				text: "Save",
				icon: Icons.save,
				click: () => {
					if (this.id) {

						// Edit existing
						this.collectionBindersService.updateBinder({
							metadata: "",
							name: this.textboxName.value,
							public: this.togglePublic.checked,
							binder_id: this.id,
							trades: this.checkboxTrades.checked
						});
					}
					else {

						// Create new
						this.collectionBindersService.addBinder({
							metadata: "",
							name: this.textboxName.value,
							public: this.togglePublic.checked,
							trades: this.checkboxTrades.checked
						});
					}
				}
			}),
			toggle: this.togglePublic
		});

		// Params
		this.route.params.subscribe(params => {
			this.id = params["id"];

			if (this.id > 0) {
				this.bindersService.getBinder(this.id);
			}
		});

		// Response get binder
		this.bindersService.getBinderObservable().subscribe(binder => {
			if (binder) {
				this.binder = binder;

				// Populate form
				this.header.toggle.checked = binder.public;
				this.textboxName.value = binder.name;
				this.checkboxTrades.checked = binder.trades;

				// Populate header
				this.header.title = "Edit Binder",
				this.header.menu = new Menu({
					classes: "round",
					items: [
						new MenuItem({
							text: "Delete Binder",
							icon: Icons.trash,
							click: () => {
								if (confirm(`Are you sure you want to delete '${binder.name}'?`)) {
									this.bindersService.deleteBinder({
										binder_id: binder.id
									});
								}
							}
						})
					]
				})
			}
		});

		// Response delete binder
		this.bindersService.deleteBinderObservable().subscribe(res => {
			if (res) {
				this.router.navigateByUrl(`/binders`);
			}
		});

		// Response create binder
		this.bindersService.addBinderObservable().subscribe(binder => {
			if (binder && binder.id) {
				this.router.navigateByUrl(`/binders/${binder.id}`);
			}
		});

		// Response update binder
		this.collectionBindersService.updateBinderObserable().subscribe(binder => {
			if (binder && binder.id) {
				this.router.navigateByUrl(`/binders/${binder.id}/edit`);
			}
		})
	}

	buildForm() {

		// Public
		this.togglePublic = new Toggle({
			text: "Private",
			textChecked: "Public"
		});

		// Form
		this.formGroup = this.formBuilder.group({
			name: '',
			trades: '',
		});

		// Name
		this.textboxName = new Textbox({
			label: "Name",
			classes: "width-6",
		});

		// Trades
		this.checkboxTrades = new Checkbox({
			text: "Cards For Trade"
		});

		// Form
		this.form = new MBForm({
			formGroup: this.formGroup,
			groups: [
				new MBFormGroup({
					controls: [
						new MBFormControl({
							classes: "width-12",
							control: this.textboxName
						}),
						new MBFormControl({
							classes: "width-12",
							control: this.checkboxTrades
						})
					]
				})
			]
		});
	}
}