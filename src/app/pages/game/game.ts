import { Deck } from '@app/pages/decks/deck/deck';
import { Board, BoardZone } from './board';
import { Sides } from '@app/models/sides';
import { GameCard } from './board/game-card';

export class Game {
	startingLifeTotal: number;
	format: string;
	players: GamePlayer[] = [];
	logs: string[] = [];
	turnCount: number = 1;

	getActivePlayer() {
		return this.players.filter(player => { return player.active })[0];
	}

    public constructor(init?:Partial<Game>) {
        Object.assign(this, init);
    }
}

export class GamePlayer {
	lifeTotal: number;
	turnOrder: number;
	deck: Deck
	active: boolean;
	gameBoard: Board;
	name: string;

    public constructor(init?:Partial<GamePlayer>) {
        Object.assign(this, init);
    }
}

export class GameUpdate {
	player: GamePlayer;
	gameAction: GameAction;
	data: any;
	viewId: number;

    public constructor(init?:Partial<GameUpdate>) {
        Object.assign(this, init);
    }
}

export enum GameAction {

	// Cards
	cardUpdated = 'Card Updated',
	cardMoved = 'Card Moved',

	// Players
	playerJoined = 'Player Joined',
	playerLeft = 'Player Left',
	playerPassedTurn = 'Player Passed Turn'
}

export enum GameEvents {
	connect = 'Connect',
	disconnect = 'Disconnect'
}

export class GameUpdateCardMoved {
	card: GameCard;
	from: BoardZone;
	to: BoardZone;
	toIndex: number;
	toSide: Sides;

    public constructor(init?:Partial<GameUpdateCardMoved>) {
        Object.assign(this, init);
    }
}

export class GameUpdateCard {
	card: GameCard;
	type: GameUpdateCardType;
	from: any;

    public constructor(init?:Partial<GameUpdateCard>) {
        Object.assign(this, init);
    }
}

export enum GameUpdateCardType {
	tap = 'Tapped',
	untap = 'Untapped',
	flip = 'Flipped',
	rotate = 'Rotated',
	clone = 'Cloned',
	counters = 'Updated Counters',
	move = 'Moved'
}

export class GameUpdatePlayer {
	// ?
}