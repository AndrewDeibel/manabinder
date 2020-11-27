import { Component, Input, OnInit } from '@angular/core';
import { Deck } from '@app/pages/decks/deck/deck';
import { Tag } from '@app/controls/tag';
import { ProgressBar } from '@app/controls/progress-bar/progress-bar';

@Component({
    selector: 'mb-deck-item-grid',
	templateUrl: './deck-item-grid.component.html',
	styleUrls: ['./deck-item-grid.component.scss']
})

export class DeckItemGridComponent implements OnInit {

	@Input() deck: Deck;
	tags: Tag[] = [];
	tagFormat: Tag;
	progressBar: ProgressBar;

    constructor() {}

    ngOnInit(): void {

		// Tags
		if (this.deck.tags != null) {
			this.deck.tags.split(' ').forEach(tag => {
				this.tags.push(new Tag({
					text: tag
				}));
			});
		}

		// Progress bar
		this.progressBar = new ProgressBar({
			value: this.deck.power_level
		});
		
		// Format tag
		this.tagFormat = new Tag({
			text: this.deck.format.name,
			classes: "primary tag-format"
		});

    }

    shadeColor(color, amount) {
        return '#' + color.replace(/^#/, '').replace(/../g, color => ('0'+Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
    }

}