import { Component, OnInit } from '@angular/core';
import { Wizard, WizardStep } from '../wizard';
import { MBForm, MBFormGroup, MBFormControl } from '@app/controls/form';
import { Textbox } from '@app/controls/textbox';
import { Textarea } from '@app/controls/textarea';
import { Select } from '@app/controls/select';
import { Icons } from '@app/models/icons';

@Component({
	selector: 'mb-deck-wizard',
	templateUrl: 'deck-wizard.component.html'
})

export class DeckWizardComponent implements OnInit {

	wizard: Wizard;
	
	constructor() { }

	ngOnInit() {
		this.wizard = new Wizard({
			title: "Create deck",
			icon: Icons.deck,
			steps: [
				new WizardStep({
					title: "N",
					form: new MBForm({
						groups: [
							new MBFormGroup({
								controls: [
									new MBFormControl({
										control: new Textbox({
											label: "Name"
										})
									}),
									new MBFormControl({
										control: new Select({
											label: "Format"
										})
									}),
									new MBFormControl({
										control: new Select({
											label: "Archetype"
										})
									})
								]
							})
						]
					})
				}),
				new WizardStep({
					form: new MBForm({
						groups: [
							new MBFormGroup({
								controls: [
									new MBFormControl({
										control: new Textarea({
											label: "Description"
										})
									}),
									new MBFormControl({
										control: new Textarea({
											label: "Search Tags"
										})
									})
								]
							})
						]
					})
				})
			]
		});
	}
}