import { Card, DeckCard } from '@app/pages/cards';

export class GameCard extends DeckCard {
	gameId: number; // Unique game card instance
	x: number;
	y: number;
	tapped: boolean;
	flipped: boolean;
	rotated: boolean;
	disableUntap: boolean = false;
	counters: GameCardCount[] = []
	
	reset() {
		this.tapped = false;
		this.flipped = false;
		this.rotated = false;
		//this.counters = null;
		//etc...
	}
}

export class GameCardCount {
	color: string;
	count: number;
}