import { Component, OnInit } from '@angular/core';
import { MBForm, MBFormGroup, MBFormControl } from '@app/controls/form';
import { Textbox } from '@app/controls/textbox';
import { Select, SelectOptionGroup, SelectOption } from '@app/controls/select';
import { Textarea } from '@app/controls/textarea';
import { Editor } from '@app/controls/editor';
import { Button } from '@app/controls/button';
import { Toggle } from '@app/controls/toggle';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ItemsHeader } from '@app/page/main/items/items-header/items-header';
import { Formats } from '@app/models/formats';
import { Archetypes } from '@app/models/archetypes';
import { CollectionDecksService } from '../collection-decks.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Icons } from '@app/models/icons';
import { DecksService } from '@app/pages/decks/decks.service';
import { Deck } from '@app/pages/decks/deck/deck';
import { Menu, MenuItem } from '@app/controls/menu/menu';

@Component({
	selector: 'mb-collection-deck',
	templateUrl: 'collection-deck.component.html'
})

export class CollectionDeckComponent implements OnInit {

	id: number;
	deck: Deck;
	form: MBForm;
	formGroup: FormGroup;
	header: ItemsHeader;
	textboxName: Textbox;
	selectPowerLevel: Select;
	selectFormat: Select;
	selectArchetype: Select;
	editorDescription: Editor;
	textareaSearchTags: Textarea;
	togglePublic: Toggle;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder,
		private decksService: DecksService,
		private collectionDecksService: CollectionDecksService
	) { }

	ngOnInit() {

		// Form
		this.buildForm();
		
		// Header
		this.header = new ItemsHeader({
			icon: Icons.deck,
			title: "Create New Deck",
			button: new Button({
				text: "Save",
				icon: Icons.save,
				click: () => {
					if (this.id) {

						// Edit existing
						this.collectionDecksService.updateDeck({
							format_id: +this.selectFormat.value,
							metadata: "",
							name: this.textboxName.value,
							public: this.togglePublic.checked,
							tags: this.textareaSearchTags.value,
							archetype: this.selectArchetype.value,
							deck_id: this.id,
							short_description: this.editorDescription.value,
							power_level: +this.selectPowerLevel.value * 10,
							commander_ids: this.deck.commander_ids.length ? JSON.stringify(this.deck.commander_ids) : null,
							companion_id: this.deck.companion_id
						});
					}
					else {

						// Create new
						this.collectionDecksService.addDeck({
							format_id: +this.selectFormat.value,
							metadata: "",
							name: this.textboxName.value,
							public: this.togglePublic.checked,
							tags: this.textareaSearchTags.value,
							achetype: this.selectArchetype.value,
							short_description: this.editorDescription.value,
							power_level: +this.selectPowerLevel.value * 10
						});
					}
				}
			})
		});

		// Params
		this.route.params.subscribe(params => {
			this.id = params["id"];

			if (this.id > 0) {
				this.decksService.getDeck(this.id);
			}
		});

		// Response get deck
		this.decksService.getDeckObservable().subscribe(deck => {
			if (deck) {
				this.deck = deck;
				this.header.title = "Edit Deck";
				this.togglePublic.checked = deck.public;
				this.textboxName.value = deck.name;
				this.selectPowerLevel.value = (deck.power_level / 10).toString();
				if (deck.format)
					this.selectFormat.value = deck.format_id.toString();
				if (deck.archetype)
					this.selectArchetype.value = deck.archetype;
				if (deck.short_description)
					this.editorDescription.value = deck.short_description;
				if (deck.tags)
					this.textareaSearchTags.value = deck.tags;
				this.header.menu = new Menu({
					classes: "round",
					items: [
						new MenuItem({
							text: "Delete Deck",
							classesLink: "button red",
							icon: Icons.trash,
							click: () => {
								if (confirm(`Are you sure you want to delete '${deck.name}'?`)) {
									this.decksService.deleteDeck({
										deck_id: deck.id
									});
								}
							}
						})
					]
				});
			}
		});

		// Response delete deck
		this.decksService.deleteDeckObservable().subscribe(res => {
			if (res) {
				this.router.navigateByUrl(`/decks`);
			}
		});

		// Response create deck
		this.collectionDecksService.addDeckObservable().subscribe(deck => {
			if (deck && deck.id) {
				this.router.navigateByUrl(`/decks/${deck.id}`);
			}
		});

		// Response update dack
		this.collectionDecksService.updateDeckObservable().subscribe(deck => {
			if (deck && deck.id) {
				this.router.navigateByUrl(`/decks/${deck.id}`);
			}
		});
	}

	buildForm() {

		// Public
		this.togglePublic = new Toggle({
			text: "Private",
			textChecked: "Public",
			checked: true,
		});

		// Form
		this.formGroup = this.formBuilder.group({
			public: '',
			name: '',
			format: '',
			archetype: '',
			description: '',
			searchTags: ''
		});

		// Name
		this.textboxName = new Textbox({
			label: "Name"
		});

		// Power level
		this.selectPowerLevel = new Select({
			label: "Power Level (1-10)",
			optionGroups: [
				new SelectOptionGroup({
					label: "Competitive",
					options: [
						new SelectOption({
							text: "10",
							value: "10"
						}),
						new SelectOption({
							text: "9",
							value: "9"
						})
					]
				}),
				new SelectOptionGroup({
					label: "Optimized",
					options: [
						new SelectOption({
							text: "8",
							value: "8"
						}),
						new SelectOption({
							text: "7",
							value: "7"
						})
					]
				}),
				new SelectOptionGroup({
					label: "Tuned",
					options: [
						new SelectOption({
							text: "6",
							value: "6"
						}),
						new SelectOption({
							text: "5",
							value: "5"
						})
					]
				}),
				new SelectOptionGroup({
					label: "Focused",
					options: [
						new SelectOption({
							text: "4",
							value: "4"
						}),
						new SelectOption({
							text: "3",
							value: "3"
						})
					]
				}),
				new SelectOptionGroup({
					label: "Unfocused",
					options: [
						new SelectOption({
							text: "2",
							value: "2"
						}),
						new SelectOption({
							text: "1",
							value: "1"
						})
					]
				})
			]
		});

		// Format
		this.selectFormat = new Select({
			label: "Format",
			optionGroups: [
				new SelectOptionGroup({
					label: "Format",
					options: Object.keys(Formats)
						.filter(key => isNaN(Number(Formats[key])))
						.map((key) => new Option(Formats[key], Formats[Formats[key]]))
				})
			]
		});
		this.selectFormat.optionGroups[0].options.unshift(new Option("Choose Format", "0"));
		this.selectFormat.value = "0";

		// Archetype
		this.selectArchetype = new Select({
			label: "Archetype",
			optionGroups: [
				new SelectOptionGroup({
					label: "Achetype",
					options: Object.keys(Archetypes)
						.filter(key => isNaN(Number(Archetypes[key])))
						.map((key) => new Option(Archetypes[key], Archetypes[Archetypes[key]]))
				})
			]
		});
		this.selectArchetype.optionGroups[0].options.unshift(new Option("Choose Achetype", "0"));
		this.selectArchetype.value = "0";

		// Description
		this.editorDescription = new Editor({
			label: "Description"
		});

		// Search tags
		this.textareaSearchTags = new Textarea({
			label: "Search Tags"
		});

		// Form
		this.form = new MBForm({
			formGroup: this.formGroup,
			groups: [
				new MBFormGroup({
					controls: [
						new MBFormControl({
							classes: "width-12",
							control: this.togglePublic
						}),
						new MBFormControl({
							classes: "width-6 small-12",
							control: this.textboxName,
						}),
						new MBFormControl({
							classes: "width-6 small-12",
							control: this.selectPowerLevel,
						}),
						new MBFormControl({
							classes: "width-6 small-12",
							control: this.selectFormat,
						}),
						new MBFormControl({
							classes: "width-6 small-12",
							control: this.selectArchetype
						})
					]
				}),
				new MBFormGroup({
					controls: [
						new MBFormControl({
							classes: "width-12",
							control: this.editorDescription
						}),
						new MBFormControl({
							classes: "width-12",
							control: this.textareaSearchTags
						})
					]
				})
			]
		});
	}
}