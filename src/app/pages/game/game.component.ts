import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Game, GamePlayer, GameAction, GameEvents, GameUpdate, GameUpdateCard, GameUpdateCardMoved, GameUpdateCardType } from './game';
import { CollectionDecksService } from '../collection/collection-decks/collection-decks.service';
import { Board, BoardZone } from './board';
import { Deck } from '@app/pages/decks/deck/deck';
import { SocketService } from './game.service';
import { Card } from '../cards';
import { Title } from '@angular/platform-browser';
import { Menu, MenuItem } from '@app/controls/menu';
import { Textbox } from '@app/controls/textbox';
import { Button } from '@app/controls/button';
import { Icons } from '@app/models';
import { DecksService } from '../decks';
import { ActivatedRoute } from '@angular/router';
import { GameCard } from './board/game-card';
import { AuthenticationService } from '../auth/auth.service';

@Component({
	selector: 'mb-game',
	templateUrl: 'game.component.html',
	styleUrls: ['./game.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class GameComponent implements OnInit {
	
	gameTable: Game;

	// Socket.io
	gameAction = GameAction;
	gameUpdates: GameUpdate[] = [];
	ioConnection: any;

	// Controls
	menuSidebar: Menu;
	menuGame: Menu;
	textboxNewMessage: Textbox;
	loading: boolean = true;
	idDeck: number;
	buttonToggleSidebar: Button;
	showSidebar: boolean = false;
	playmatUrl: string;

	constructor(
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService,
		private decksService: DecksService,
		private titleService: Title,
		private socketService: SocketService,
		private collectionDeckService: CollectionDecksService) { }

	ngOnInit() {
		this.route.params.subscribe(params => {
			if (params["id"]) {
				this.idDeck = +params["id"];
				this.createGame();
			}
		});

		this.titleService.setTitle('Mana Binder: Playtest');
		this.buildControls();
		//this.initIoConnection();
	}

	ngAfterViewInit() {
		if (this.gameTable.players.length) {
			setTimeout(() => {
				this.onResize();
			}, 500);
		}
		window.addEventListener("beforeunload", (event) => {
			event.preventDefault();
			event.returnValue = "Are you sure you want to leave the game?";
			return event;
		});
	}

	onResize() {
		let wrapper = <HTMLElement>document.querySelector(".game-board-wrapper");
		let gameBoard = <HTMLElement>document.querySelector(".board");
		let windowWidth = window.innerWidth;
		let windowHeight = window.innerHeight;
		let wrapperWidth = wrapper.clientWidth;
		let wrapperHeight = wrapper.clientHeight;
		let gameBoardWidth = gameBoard.clientWidth;
		let gameBoardAspectRatio = 500/(285 + 90); // + 90 to account for hand

		// Reset to 100% before chcking overflow y
		gameBoard.style.width = `${wrapperWidth}px`;
		gameBoard.style.height = `${wrapperWidth / gameBoardAspectRatio}px`;
	
		let gameBoardHeight = gameBoard.clientHeight;
		
		// Overflow y
		if (gameBoardHeight > wrapperHeight) {
			gameBoard.style.height = `${wrapperHeight}px`;
			gameBoard.style.width = `${wrapperHeight * gameBoardAspectRatio}px`;
		}
		else if (gameBoardWidth > wrapperWidth) {
			gameBoard.style.width = `${wrapperWidth}px`;
			gameBoard.style.height = `${wrapperWidth / gameBoardAspectRatio}px`;
		}
		else {
			gameBoard.style.width = `${wrapperWidth}px`;
			gameBoard.style.height = `${wrapperWidth / gameBoardAspectRatio}px`;
		}
		console.log('resized');
	}

	buildControls() {
		// Button toggle sidebar
		this.buttonToggleSidebar = new Button({
			icon: Icons.caretUp,
			click: () => {
				this.showSidebar = !this.showSidebar;
				this.buttonToggleSidebar.icon = this.showSidebar ? Icons.caretDown : Icons.caretUp;
			}
		});
		// Menu game
		this.menuGame = new Menu({
			classes: "round",
			items: [
				// new MenuItem({
				// 	icon: Icons.play,
				// 	text: "Start Game",
				// 	click: () => {
				// 		this.createGame();
				// 	}
				// }),
				// new MenuItem({
				// 	icon: Icons.stop,
				// 	text: "End Game"
				// }),
				new MenuItem({
					icon: Icons.image,
					text: "Change Playmat",
					click: () => {
						this.gameTable.players[0].gameBoard.art = prompt("Enter Playmat Image URL, we suggest using http://www.artofmtg.com/", "");
					}
				}),
				new MenuItem({
					icon: Icons.sync,
					text: "Restart Game",
					click: () => {
						this.createGame();
					}
				}),
				new MenuItem({
					icon: Icons.signOut,
					text: "Leave Game",
					click: () => {
						window.location.href = "/";
					}
				}),
				// new MenuItem({
				// 	separator: true
				// }),
				// new MenuItem({
				// 	icon: Icons.keyboard,
				// 	text: "Shortcuts"
				// }),
			]
		});
		// Menu sidebar
		this.menuSidebar = new Menu({
			classes: "round",
			items: [
				// new MenuItem({
				// 	icon: Icons.alert,
				// 	text: "In Reponse",
				// 	click: () => {
				// 		this.menuSidebar.clearActive();
				// 	}
				// }),
				// new MenuItem({
				// 	icon: Icons.thumbsUp,
				// 	text: "No Response",
				// 	click: () => {
				// 		this.menuSidebar.clearActive();
				// 	}
				// }),
				// new MenuItem({
				// 	separator: true
				// }),
				new MenuItem({
					icon: Icons.diceThree,
					text: "Roll Dice",
					menu: new Menu ({
						classes: "anchor-bottom bg round",
						items: [
							new MenuItem({
								text: "D4",
								icon: Icons.d4,
								click: () => {
									this.menuSidebar.clearActive();
									let result = this.randomNumber(1, 4);
									let activePlayer = this.gameTable.getActivePlayer();
									activePlayer.gameBoard.closeOverlays();
									activePlayer.gameBoard.showOverlayDice = true;
									activePlayer.gameBoard.diceRoll = result;
									activePlayer.gameBoard.diceRollIcon = Icons.d4;
								}
							}),
							new MenuItem({
								text: "D6",
								icon: Icons.d6,
								click: () => {
									this.menuSidebar.clearActive();
									let result = this.randomNumber(1, 6);
									let activePlayer = this.gameTable.getActivePlayer();
									activePlayer.gameBoard.closeOverlays();
									activePlayer.gameBoard.showOverlayDice = true;
									activePlayer.gameBoard.diceRoll = result;
									activePlayer.gameBoard.diceRollIcon = Icons.d6;
								}
							}),
							new MenuItem({
								text: "D8",
								icon: Icons.d8,
								click: () => {
									this.menuSidebar.clearActive();
									let result = this.randomNumber(1, 8);
									let activePlayer = this.gameTable.getActivePlayer();
									activePlayer.gameBoard.closeOverlays();
									activePlayer.gameBoard.showOverlayDice = true;
									activePlayer.gameBoard.diceRoll = result;
									activePlayer.gameBoard.diceRollIcon = Icons.d8;
								}
							}),
							new MenuItem({
								text: "D10",
								icon: Icons.d10,
								click: () => {
									this.menuSidebar.clearActive();
									let result = this.randomNumber(1, 10);
									let activePlayer = this.gameTable.getActivePlayer();
									activePlayer.gameBoard.closeOverlays();
									activePlayer.gameBoard.showOverlayDice = true;
									activePlayer.gameBoard.diceRoll = result;
									activePlayer.gameBoard.diceRollIcon = Icons.d10;
								}
							}),
							new MenuItem({
								text: "D12",
								icon: Icons.d12,
								click: () => {
									this.menuSidebar.clearActive();
									let result = this.randomNumber(1, 12);
									let activePlayer = this.gameTable.getActivePlayer();
									activePlayer.gameBoard.closeOverlays();
									activePlayer.gameBoard.showOverlayDice = true;
									activePlayer.gameBoard.diceRoll = result;
									activePlayer.gameBoard.diceRollIcon = Icons.d12;
								}
							}),
							new MenuItem({
								text: "D20",
								icon: Icons.d20,
								click: () => {
									this.menuSidebar.clearActive();
									let result = this.randomNumber(1, 20);
									let activePlayer = this.gameTable.getActivePlayer();
									activePlayer.gameBoard.closeOverlays();
									activePlayer.gameBoard.showOverlayDice = true;
									activePlayer.gameBoard.diceRoll = result;
									activePlayer.gameBoard.diceRollIcon = Icons.d20;
								}
							}),
						]
					})
				}),
				new MenuItem({
					icon: Icons.coin,
					text: "Flip Coin",
					click: () => {
						this.menuSidebar.clearActive();
						let result = this.randomNumber(0, 1);
						let activePlayer = this.gameTable.getActivePlayer();
						activePlayer.gameBoard.closeOverlays();
						activePlayer.gameBoard.showOverlayCoin = true;
						activePlayer.gameBoard.coinHeads = result === 1;
					}
				})
			]
		});
		// Textbox chat
		this.textboxNewMessage = new Textbox({
			placeholder: "New Message...",
			classes: "txt-game-chat"
		});
	}

	onGameUpdate(gameUpdate: GameUpdate) {
		let player: GamePlayer = gameUpdate.player;
		let card: GameCard = gameUpdate.data.card;
		switch(gameUpdate.gameAction) {
			case GameAction.cardMoved: {
				// this.socketService.send({
				// 	data: new GameUpdateCardMoved({
				// 		card: gameUpdate.data.card,
				// 		from: gameUpdate.data.from,
				// 		to: gameUpdate.data.to,
				// 		toSide: gameUpdate.data.toSide,
				// 		toIndex: gameUpdate.data.toIndex,
				// 	}),
				// 	gameAction: GameAction.cardMoved,
				// 	viewId: player.gameBoard.viewId,
				// 	player: player
				// });
				debugger;
				this.gameTable.logs.push(`${player.name} moved ${card.card.name} from ${gameUpdate.data.from} to ${gameUpdate.data.to}`);
				break;
			}
			case GameAction.cardUpdated: {
				// this.socketService.send({
				// 	data: new GameUpdateCard({
				// 		card: gameUpdate.data.card,
				// 		from: gameUpdate.data.from
				// 	}),
				// 	gameAction: GameAction.cardUpdated,
				// 	viewId: player.gameBoard.viewId,
				// 	player: player
				// });
				this.gameTable.logs.push(`${player.name} ${gameUpdate.data.type.toString().toLowerCase()} ${card.card.name} ${gameUpdate.data.from === BoardZone.battlefield ? 'on' : 'in'} ${gameUpdate.data.from}`);
				break;
			}
			case GameAction.playerJoined: {
				break;
			}
			case GameAction.playerLeft: {
				break;
			}
			case GameAction.playerPassedTurn: {
				this.gameTable.turnCount++;
				this.gameTable.logs.push(`${player.name} plassed the turn`);
				break;
			}
		}
	}

	randomNumber(min, max): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	private initIoConnection(): void {
		this.socketService.initSocket();

		this.ioConnection = this.socketService.onGameUpdate().subscribe((gameUpdate: GameUpdate) => {
			this.gameUpdates.push(gameUpdate);

			// Prevent updating one's own view
			if (gameUpdate.viewId != this.gameTable.players[0].gameBoard.viewId) {
				let card = new GameCard();
				card.card = gameUpdate.data.card;
				switch (gameUpdate.gameAction) {
					case GameAction.cardMoved: {
						let board = this.gameTable.players[0].gameBoard;

						// Top/bottom
						if (gameUpdate.data.toSide !== undefined) {
							let result = board.moveCard(card, board[gameUpdate.data.from], gameUpdate.data.toSide, board[gameUpdate.data.to]);
							board[gameUpdate.data.from] = result.from;
							board[gameUpdate.data.to] = result.to;
						}

						// Index
						else if (gameUpdate.data.toIndex !== undefined) {
							let oldIndex = board[gameUpdate.data.from].findIndex(card => card.id === card.id);
							board.moveCardIndex(board[gameUpdate.data.from], oldIndex, gameUpdate.data.toIndex);
						}
						break;
					}
					case GameAction.cardUpdated: {
						let zone: Card[] = this.gameTable.players[0].gameBoard[gameUpdate.data.from];
						let _card = zone.find(__card => __card.id == card.id);
						
						let oldCard = zone[zone.findIndex(__card => __card.id == _card.id)];
						let newCard = card;
						Object.assign(oldCard, newCard);

						break;
					}
					case GameAction.playerJoined: {
						break;
					}
					case GameAction.playerLeft: {
						break;
					}
				}
			}
		});

		this.socketService.onEvent(GameEvents.connect).subscribe(() => {
			console.log('connected');
		});
		
		this.socketService.onEvent(GameEvents.disconnect).subscribe(() => {
			console.log('disconnected');
		});
	}

	createGame() {
		
		// Get deck
		this.decksService.getDeckObservable().subscribe(deck => {
			if (deck) {
				this.addPlayer(deck, 1);
				setTimeout(() => {
					this.loading = false;
				}, 500);
			}
		});
		this.decksService.getDeck(this.idDeck);

		this.gameTable = new Game({
			format: "Commander",
			startingLifeTotal: 40,
		});

		setTimeout(() => {
			this.onResize();
		}, 1000);

		this.gameTable.logs.push("Game started");
	}

	addPlayer(deck: Deck, turnOrder: number) {
		let player = new GamePlayer({
			active: turnOrder === 1,
			lifeTotal: this.gameTable.startingLifeTotal,
			name: this.authenticationService.currentUserValue.username,
			deck: deck
		});
		player.gameBoard = new Board({
			deck: deck,
			player: player,
			//art: "https://media.magic.wizards.com/images/wallpaper/force-of-will_2xm_2560x1600_wallpaper.jpg"
		}),
		this.gameTable.players.push(
			player,
		);
		
		this.gameTable.logs.push(`Player ${player.name} joined`);
	}
}