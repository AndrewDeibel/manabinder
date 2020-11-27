import { Card } from '@app/pages/cards';
import { BoardZone } from './board';

export class Zone {
	cards: Card[] = [];
	type: BoardZone;
}

export class Library extends Zone {
	revealed: boolean = false;
	type: BoardZone = BoardZone.library;
}

export class Hand extends Zone {
	revealed: boolean = false;
	type: BoardZone = BoardZone.hand;
}

export class Graveyard extends Zone {
	type: BoardZone = BoardZone.graveyard;
}

export class Exile extends Zone {
	type: BoardZone = BoardZone.exile;
}

export class CommandZone extends Zone {
	type: BoardZone = BoardZone.commandZone;
}