import { Component, OnInit, ViewEncapsulation, ViewChild, TemplateRef, ViewContainerRef, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Board, BoardZone } from './board';
import { Card } from '../../cards';
import { Overlay, OverlayRef, FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { CdkDragDrop, CdkDragEnd, CdkDragStart, CdkDragMove, moveItemInArray, transferArrayItem, Point, DragRef } from '@angular/cdk/drag-drop';
import { Sides, Corners } from '@app/models/sides';
import { TemplatePortal } from '@angular/cdk/portal';
import { Subscription, fromEvent } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { GameUpdate, GameUpdateCardMoved, GameAction, GameUpdateCard, GameUpdateCardType } from '../game';
import { Menu, MenuItem } from '@app/controls/menu';
import { Button } from '@app/controls/button';
import { Icons } from '@app/models';
import { GameBoardService } from './board.service';
import { Counter } from './counter';
import { GameCard } from './game-card';

export interface CardDragPosition {
	leftOffsetPercent: number;
	topOffsetPercent: number;
}

@Component({
	selector: 'mb-board',
	templateUrl: 'board.component.html',
	styleUrls: ['./board.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class BoardComponent implements OnInit {
	
	// Input/ouput
	@Input() gameBoard: Board;
	@Output() gameUpdate: EventEmitter<GameUpdate> = new EventEmitter;

	// Controls
	menuPhases: Menu;
	loading: boolean;
	gameCardID: number = 0;

	// Menu overlay
	subscriptionClickOutside: Subscription;
	overlayRef: OverlayRef | null;
	@ViewChild('menuBoard') menuBoard: TemplateRef<any>;

	constructor(
		private gameBoardService: GameBoardService,
		private overlay: Overlay,
		public viewContainerRef: ViewContainerRef) { }

	ngOnInit() {
		this.buildControls();

		let cards: GameCard[] = [];

		// Build cards
		this.gameBoard.deck.cards.forEach(userCard => {
			let card: GameCard = new GameCard();
			card.gameId = this.gameCardID++;
			card.card = userCard.card;
			if (this.gameBoard.deck.commander_ids.includes(card.card.id)) {
				this.gameBoard.commandZone.push(card);
			}
			else {
				cards.push(card);
			}
		});
		this.gameBoard.library = cards;
		this.gameBoard.gameUpdate = (gameUpdate: GameUpdate) => {
			this.gameUpdate.next(gameUpdate);
		}
		this.gameBoard.startGame();

		// Get tokens
		this.gameBoardService.tokensObservable().subscribe(tokens => {
			//this.gameBoard.tokens = tokens.map(token => new GameCard());
			tokens.forEach(token => {
				let gameCard = new GameCard();
				gameCard.gameId = this.gameCardID++;
				gameCard.card = token;
				this.gameBoard.tokens.push(gameCard);
			})
		});
		this.gameBoardService.tokens();

		this.gameBoard.buttonCloseOverlay = new Button({
			icon: Icons.close,
			click: () => {
				this.gameBoard.closeOverlayCards();
			}
		});
	}

	buildControls() {
		// Menu phases
		this.menuPhases = new Menu({
			classes: "horizontal round",
			clearActiveClickOutside: false,
		});
		let main1 = new MenuItem({
			text: "Main 1",
			icon: Icons.hourglassStart,
			click: () => {
				this.menuPhases.clearActive();
				main1.active = true;
			}
		});
		let combat = new MenuItem({
			text: "Combat",
			icon: Icons.swords,
			click: () => {
				this.menuPhases.clearActive();
				combat.active = true;
			}
		});
		let main2 = new MenuItem({
			text: "Main 2",
			icon: Icons.hourglassEnd,
			click: () => {
				this.menuPhases.clearActive();
				main2.active = true;
			}
		});
		let pass = new MenuItem({
			text: "Pass Turn",
			icon: Icons.pass,
			click: () => {
				this.menuPhases.clearActive();
				this.gameBoard.untapAll();
				//this.gameBoard.drawCard();
				this.gameBoard.gameUpdate(new GameUpdate({
					data: {},
					gameAction: GameAction.playerPassedTurn,
					viewId: this.gameBoard.viewId,
					player: this.gameBoard.player
				}));
			}
		});
		this.menuPhases.items.push(
			// main1,
			// combat,
			// main2,
			pass
		);
	}

	handleEnterKeyPress(event) {
		event.preventDefault();
		return false;
	}

	showTokens() {
		this.gameBoard.showOverlayCards = true;
		this.gameBoard.overlayCards = this.gameBoard.tokens.map(token => token);
		this.gameBoard.filterOverlayCards();
	}

	searchDeck() {
		this.gameBoard.showOverlayCards = true;
		this.gameBoard.overlaySource = BoardZone.library;

		// Clear overlay
		this.gameBoard.overlayCards = [];

		// Add cards (reverse so bottom of array shows as first card (top of deck))
		this.gameBoard.library.forEach(card => {
			this.gameBoard.overlayCards.unshift(card);
		});
		
		this.gameBoard.overlayCardsFiltered = this.gameBoard.overlayCards;
		this.gameBoard.overlaySource = BoardZone.library;
	}

	searchGraveyard() {
		this.gameBoard.showOverlayCards = true;

		// Clear overlay
		this.gameBoard.overlayCards = [];

		// Add cards (reverse so bottom of array shows as first card (top of graveyard))
		this.gameBoard.graveyard.forEach(card => {
			this.gameBoard.overlayCards.unshift(card);
		});

		this.gameBoard.overlayCardsFiltered = this.gameBoard.overlayCards;
		this.gameBoard.overlaySource = BoardZone.graveyard;
	}

	searchExile() {
		this.gameBoard.showOverlayCards = true;

		// Clear overlay
		this.gameBoard.overlayCards = [];

		// Add cards (reverse so bottom of arry shows as first card (top of exile))
		this.gameBoard.exile.forEach(card => {
			this.gameBoard.overlayCards.unshift(card);
		});

		this.gameBoard.overlayCardsFiltered = this.gameBoard.overlayCards;
		this.gameBoard.overlaySource = BoardZone.exile;
	}

	onClickOverlayCardsCard(event: MouseEvent, card: GameCard) {
		card.x = this.gameBoard.centerX;
		card.y = this.gameBoard.centerY;

		switch (this.gameBoard.overlaySource) {
			case BoardZone.library:
				this.gameBoard.overlayCards = this.gameBoard.removeCardFrom(card, this.gameBoard.overlayCards);
				this.gameBoard.library = this.gameBoard.removeCardFrom(card, this.gameBoard.library);
				this.gameBoard.moveCardTo(card, Sides.top, this.gameBoard.hand);
				break;

			case BoardZone.graveyard:
				this.gameBoard.overlayCards = this.gameBoard.removeCardFrom(card, this.gameBoard.overlayCards);
				this.gameBoard.graveyard = this.gameBoard.removeCardFrom(card, this.gameBoard.graveyard);
				this.gameBoard.moveCardTo(card, Sides.top, this.gameBoard.battlefield);
				break;

			case BoardZone.exile:
				this.gameBoard.overlayCards = this.gameBoard.removeCardFrom(card, this.gameBoard.overlayCards);
				this.gameBoard.exile = this.gameBoard.removeCardFrom(card, this.gameBoard.exile);
				this.gameBoard.moveCardTo(card, Sides.top, this.gameBoard.battlefield);
				break;

				// Tokens
			default:
				this.gameBoard.moveCardTo(card, Sides.top, this.gameBoard.battlefield);
				break;
		}

		this.gameBoard.filterOverlayCards();
		
		this.gameBoard.gameUpdate(new GameUpdate({
			data: new GameUpdateCardMoved({
				card: card,
				from: BoardZone.commandZone,
				to: BoardZone.battlefield,
				toSide: Sides.top,
			}),
			gameAction: GameAction.cardMoved,
			viewId: this.gameBoard.viewId,
			player: this.gameBoard.player
		}));
	}

	// Context menus
	onRightClickBattlefieldCard(event: MouseEvent, card: GameCard) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuBattlefieldCard(card, () => { this.closeOverlayMenus(); });
		this.onRightClick(event.x, event.y, card, Corners.bottomRight);
	}
	onRightClickBattlefield(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuBattlefield(
			() => { this.closeOverlayMenus(); },
			() => { this.showTokens(); }
		);
		this.onRightClick(event.x, event.y, null, Corners.bottomRight);
	}
	onRightClickCounter(event: MouseEvent, counter: Counter) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuCounter(counter, () => { this.closeOverlayMenus(); });
		this.onRightClick(event.x, event.y, null, Corners.bottomLeft);
	}
	onRightClickLibrary(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuLibrary(
			() => { this.closeOverlayMenus(); },
			() => { this.searchDeck(); }
		);
		this.onRightClick(event.x, event.y, null, Corners.bottomLeft);
	}
	onRightClickGraveyard(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuGraveyard(
			() => { this.closeOverlayMenus(); },
			() => { this.searchGraveyard(); }
		);
		this.onRightClick(event.x, event.y, null, Corners.bottomLeft);
	}
	onRightClickExile(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuExile(
			() => { this.closeOverlayMenus(); },
			() => { this.searchExile(); }
		);
		this.onRightClick(event.x, event.y, null, Corners.topLeft);
	}
	onRightClickOverlayCard(event: MouseEvent, card: GameCard) {
		return false;
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuOverlayCard(card, () => { this.closeOverlayMenus(); });
		this.onRightClick(event.x, event.y, card, Corners.topRight);
	}
	onRightClickCommandZoneCard(event: MouseEvent, card: GameCard) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuCommandZone(card, () => { this.closeOverlayMenus(); });
		this.onRightClick(event.x, event.y, card, Corners.topLeft);
	}
	onRightClickHandCard(event: MouseEvent, card: GameCard) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuHandCard(card, () => { this.closeOverlayMenus(); });
		this.onRightClick(event.x, event.y, card, Corners.topRight);
	}
	onRightClickHand(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		this.gameBoard.buildMenuHand(() => { this.closeOverlayMenus(); });
		this.onRightClick(event.x, event.y, null, Corners.topRight);
	}
	onRightClick(x, y, card?: GameCard, position?: Corners) {

		// Close
		this.closeOverlayMenus();

		// Position
		const positionStrategy:FlexibleConnectedPositionStrategy = this.overlay.position().flexibleConnectedTo({x, y});
		position = position ? position : Corners.bottomRight; // Default - bottom right
		switch (position) {
			case Corners.bottomLeft:
				positionStrategy.withPositions([{
					originX: 'start',
					originY: 'bottom',
					overlayX: 'end',
					overlayY: 'top',
				}]);
				break;
			case Corners.topLeft:
				positionStrategy.withPositions([{
					originX: 'start',
					originY: 'bottom',
					overlayX: 'end',
					overlayY: 'bottom',
				}]);
				break;
			case Corners.topRight:
				positionStrategy.withPositions([{
					originX: 'start',
					originY: 'bottom',
					overlayX: 'start',
					overlayY: 'bottom',
				}]);
				break;
			case Corners.bottomRight:
				positionStrategy.withPositions([{
					originX: 'start',
					originY: 'bottom',
					overlayX: 'start',
					overlayY: 'top',
				}]);
				break;
		}

		// Overlay
		this.overlayRef = this.overlay.create({
			positionStrategy,
			scrollStrategy: this.overlay.scrollStrategies.close()
		});
		this.overlayRef.attach(
			new TemplatePortal(
				this.menuBoard,
				this.viewContainerRef,
				{ $implicit: card }
			)
		);

		// Close menu when click outside
		this.subscriptionClickOutside = fromEvent<MouseEvent>(document, 'click').pipe(filter(event => {
			const clickTarget = event.target as HTMLElement;
			return !!this.overlayRef && !this.overlayRef.overlayElement.contains(clickTarget);
		}), take(1)).subscribe(() => this.closeOverlayMenus())
	}

	getZoneFromClassList(classes: DOMTokenList): BoardZone {
		var zone: BoardZone;

		if (classes.contains("battlefield"))
			zone = BoardZone.battlefield;
		else if (classes.contains("library"))
			zone = BoardZone.library;
		else if (classes.contains("graveyard"))
			zone = BoardZone.graveyard;
		else if (classes.contains("exile"))
			zone = BoardZone.exile;
		else if (classes.contains("hand"))
			zone = BoardZone.hand;
		else if (classes.contains("commandZone"))
			zone = BoardZone.commandZone;
		else if (classes.contains("companionZone"))
			zone = BoardZone.companionZone;

		return zone;
	}

	// Drop
	drop(event: CdkDragDrop<string[]>) {

		var toZone = this.getZoneFromClassList(event.container.element.nativeElement.closest(".zone").classList);
		var fromZone = this.getZoneFromClassList(event.previousContainer.element.nativeElement.closest(".zone").classList);

		// Moved within zone
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
			
			// Update server
			this.gameBoard.gameUpdate(new GameUpdate({
				data: new GameUpdateCard({
					card: event.item.data.card,
					from: fromZone,
					type: GameUpdateCardType.move,
				}),
				gameAction: GameAction.cardUpdated,
				viewId: this.gameBoard.viewId,
				player: this.gameBoard.player
			}));
		}

		// Moved to new zone
		else {
			var toIndex = event.container.data.length; //zone.classList.contains("hand") ? event.currentIndex : 0;
			var fromIndex: number;

			// Library card is placeholder, so need to pull from top of deck
			if (fromZone == BoardZone.library) 
				fromIndex = this.gameBoard.library.length;
			else
				fromIndex = event.previousContainer.data.indexOf(event.item.data, 0);

			var card = (event.previousContainer.data[event.previousIndex] as unknown as GameCard);

			// Token from battlefield > graveyard/exile, remove it
			if (card.card.token
				&& fromZone == BoardZone.battlefield
				&& (toZone == BoardZone.graveyard || toZone == BoardZone.exile)) {
				this.gameBoard.removeCardFromIndex(fromIndex, this.gameBoard.battlefield);
			}
			else {

				transferArrayItem(event.previousContainer.data, event.container.data, fromIndex, toIndex);	

				card = event.container.data[toIndex] as unknown as GameCard;
				
				card.reset();

				if (fromZone === BoardZone.library && toZone === BoardZone.battlefield) {
					card.x = this.gameBoard.lastCardX;
					card.y = this.gameBoard.lastCardY;
				}		

				// Update server
				this.gameBoard.gameUpdate(new GameUpdate({
					data: new GameUpdateCardMoved({
						card: event.container.data[event.currentIndex] as unknown as GameCard,
						from: fromZone,
						to: toZone,
						toSide: Sides.top
					}),
					gameAction: GameAction.cardMoved,
					viewId: this.gameBoard.viewId,
					player: this.gameBoard.player
				}));
			}
			
		}
	}

	calculateDragPosition(cardEl: HTMLElement): CardDragPosition {

		// Playmat
		let playmat = document.getElementsByClassName("battlefield")[0];
		let playmatBox = playmat.getBoundingClientRect();
		let playmatX = playmatBox.left;
		let playmatY = playmatBox.top;
		let playmatWidth = playmat.clientWidth;
		let playmatHeight = playmat.clientHeight;

		// Card
		let cardBox = cardEl.getBoundingClientRect();
		let cardX = cardBox.left;
		let cardY = cardBox.top;

		// Offsets
		let leftOffset = cardX - playmatX;
		let topOffset = cardY - playmatY;
		let leftOffsetPercent = (leftOffset / playmatWidth) * 100;
		let topOffsetPercent = (topOffset / playmatHeight) * 100;

		return {
			leftOffsetPercent,
			topOffsetPercent
		}
	}

	// Drag
	drag(event: CdkDragMove, item: any) {
		let cardEl = event.source.element.nativeElement.nextSibling as HTMLElement;
		let offsets = this.calculateDragPosition(cardEl);
		
		// Update card
		item.x = offsets.leftOffsetPercent;
		item.y = offsets.topOffsetPercent;

		// Update last card
		// Used for placeholder cards like dragging from top of library
		this.gameBoard.lastCardX = item.x;
		this.gameBoard.lastCardY = item.y;
	}

	constrainPosition(point: Point, dragRef: DragRef) {
		// let cardEl = dragRef.data.element.nativeElement as HTMLElement;
		// let offsets = this.calculateDragPosition(cardEl);

		// let validTop = offsets.topOffsetPercent / 10 = ;
		// let validLeft = ;
	}

	topLibrary() {
		return [this.gameBoard.library[0]];
	}

	closeOverlayMenus() {
		this.subscriptionClickOutside && this.subscriptionClickOutside.unsubscribe();
		if (this.overlayRef) {
			this.overlayRef.dispose();
			this.overlayRef = null;
		}
	}
}