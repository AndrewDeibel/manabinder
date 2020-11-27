import { Menu, MenuItem } from '@app/controls/menu';
import { Textbox } from '@app/controls/textbox';
import { Button } from '@app/controls/button';
import { Sides } from '@app/models/sides';
import { GameUpdate, GameAction, GameUpdateCardMoved, GameUpdateCard, GamePlayer, GameUpdateCardType } from '../game';
import { Deck } from '@app/pages/decks/deck/deck';
import { Icons } from '@app/models/icons';
import { Counter } from './counter';
import { GameCard } from './game-card';

export enum BoardZone {
	library = "library",
	hand = "hand",
	battlefield = "battlefield",
	commandZone = "commandZone",
	companionZone = "companionZone",
	graveyard = "graveyard",
	exile = "exile"
}

export class Board {
	deck: Deck;
	art: string;
	overlaySource: BoardZone;
	backgroundColor: string = "rgba(49,48,53,.5)";
	hand: GameCard[] = [];
	exile: GameCard[] = [];
	library: GameCard[] = [];
	graveyard: GameCard[] = [];
	battlefield: GameCard[] = [];
	commandZone: GameCard[] = [];
	tokens: GameCard[] = []; // All tokens, loaded on gamestart
	counters: Counter[] = [];
	centerX:number = 46;
	centerY:number = 42;
	shuffling: boolean = false;
	viewId: number;
	counterId: number;
	overlayCard: GameCard;
	overlayCards: GameCard[] = [];
	showOverlayCards: boolean = false;
	showOverlayDice: boolean = false;
	showOverlayCoin: boolean = false;
	overlayCardsFiltered: GameCard[] = [];
	textboxOverlay: Textbox;
	buttonCloseOverlay: Button;
	player: GamePlayer;
	diceRoll: number;
	diceRollIcon: Icons;
	coinHeads: boolean;

	// Used to track library placeholder card and update
	// x/y value on card from library once dropped
	lastCardX: number;
	lastCardY: number;
	
	gameUpdate: (gameUpdate: GameUpdate) => void;

	menuBoard: Menu;

    constructor(init?:Partial<Board>) {
		Object.assign(this, init);

		this.textboxOverlay = new Textbox({
			icon: Icons.search,
			placeholder: "Search cards...",
			clearable: true,
			keydownEnter: value => {
				this.filterOverlayCards();
			},
			clickIcon: value => {
				this.filterOverlayCards();
			}
		});
	}

	closeOverlays() {
		this.overlayCard = null;
		this.showOverlayCards = false;
		this.showOverlayDice = false;
		this.showOverlayCoin = false;
	}

	closeOverlayCard() {
		this.overlayCard = null;
	}

	closeOverlayCards() {

		// If library was source, save reordering
		if (this.overlaySource === BoardZone.library) {

			// Remove cards
			this.overlayCards.forEach(overlayCard => {
				this.library = this.library.filter(libraryCard => {
					return libraryCard.gameId !== overlayCard.gameId;
				});
			});

			// Add cards in new order
			this.overlayCards.slice().reverse().forEach(overlayCard => {
				this.library.push(overlayCard);
			});
		}
		this.overlayCards = [];
		this.overlaySource = null;
		this.showOverlayCards = false;
	}
	
	closeOverlayDice() {
		this.showOverlayDice = false;
	}
	
	closeOverlayCoin() {
		this.showOverlayCoin = false;
	}

	startGame() {
		this.library = this.shuffle(this.library);

		// Wait for initial shuffle
		setTimeout(() => {
			this.drawCards(7);
		}, 2000);
		this.viewId = this.randomNumber(1, 1000);
	}

	randomNumber(min, max): number {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	drawCards(count: number) {
		for (let i = 0; i < count; i++) {
			this.delayDraw(i);
		}
	}

	delayDraw(i) {
		setTimeout(() => {
			this.drawCard();
		}, 200 * i);
	}

	drawCard() {
		let card = this.removeCardFromSide(Sides.top, this.library);
		this.moveCardTo(card, Sides.top, this.hand);
	}

	discardHand() {
		this.hand.forEach(card => {
			let _card = card;
			this.hand = this.removeCardFrom(card, this.hand);
			this.moveCardTo(_card, Sides.top, this.graveyard);
		});
	}

	millCards(count: number) {
		for (let i = 0; i < count; i++) {
			this.millCard();
		}
	}

	millCard() {
		let card = this.removeCardFromSide(Sides.top, this.library);
		this.moveCardTo(card, Sides.top, this.graveyard);
	}

	moveCardFromTo(fromSide: Sides, from: any, toSide: Sides, to: any) {
		this.moveCardTo(this.removeCardFromSide(fromSide, from), toSide, to);
	}

	removeCardFromSide(side: Sides, from: any) {
		switch (side) {
			case Sides.top: {
				return from.pop();
				break;
			}
			case Sides.bottom: {
				return from.shift();
				break;
			}
		}
	}
	
	removeCardFromIndex(index: number, from: any) {
		from.splice(index, 1);
	}

	getCardFromSide(side: Sides, from: any) {
		switch (side) {
			case Sides.top: {
				return from[from.length - 1];
			}
			case Sides.bottom: {
				return from[0];
			}
		}
	}

	getCardFromIndex(from: any, index: number) {
		return from[index];
	}

	getCardsFromSide(count: number, side: Sides, from: any) {
		let cards: GameCard[] = [];
		for (let i = 0; i < count; i++) {
			switch (side) {
				case Sides.top:
					cards.push(this.getCardFromIndex(from, from.length - i - 1));
					break;
				case Sides.bottom:
					cards.push(this.getCardFromIndex(from, 0 + i));
					break;
			}
		}
		return cards;
	}

	moveCardTo(card: GameCard, side: Sides, to: any) {
		switch (side) {
			case Sides.top: {
				to.push(card);
				break;
			}
			case Sides.bottom: {
				to.unshift(card);
				break;
			}
		}
	}

	moveCard(card: GameCard, from: any, toSide: Sides, to: any) {
		let fromEqualsTo = from == to;
		from = this.removeCardFrom(card, from);
		if (fromEqualsTo) {
			// If from and to are same list (moveing within a list)
			// update to to property before moving the item to it
			to = from;
		}
		this.moveCardTo(card, toSide, to);

		return {
			from,
			to
		};
	}

	moveCardForward(card: GameCard, from: any) {
		let index = from.indexOf(card);
		return this.moveCardIndex(from, index, index - 1);
	}

	moveCardBackward(card: GameCard, from: any) {
		let index = from.indexOf(card);
		return this.moveCardIndex(from, index, index + 1);
	}

	moveCardIndex(from, oldIndex, newIndex) {
		if (newIndex >= from.large) {
			let i = newIndex - from.length + 1;
			while (i--) {
				from.push(undefined);
			}
		}
		from.splice(newIndex, 0, from.splice(oldIndex, 1)[0]);
		return from;
	}

	removeCardFrom(card: GameCard, from: any) {
		// If card found
		if (from.filter(card => {
			return card === card;
		}).length) {
			// Remove card
			from = from.filter((_card: GameCard) => {
				return _card.gameId !== card.gameId;
			});
		}
		return from;
	}

	shuffle(array) {
		var m = array.length, t, i;
		
		// While there remain elements to shuffle
		while (m) {
			// Pick a remaining element…
			i = Math.floor(Math.random() * m--);
		
			// And swap it with the current element.
			t = array[m];
			array[m] = array[i];
			array[i] = t;
		}

		this.shuffling = true;
		setTimeout(() => {
			this.shuffling = false;
		}, 2000);
		
		return array;
	}

	tapUntap(card: GameCard) {
		if (!card.disableUntap || !card.tapped) {
			card.tapped = !card.tapped;
									
			this.gameUpdate(new GameUpdate({
				data: new GameUpdateCard({
					card: card,
					from: BoardZone.battlefield,
					type: card.tapped ? GameUpdateCardType.tap : GameUpdateCardType.untap
				}),
				gameAction: GameAction.cardUpdated,
				viewId: this.viewId,
				player: this.player
			}));
		}
	}

	tapAll() {
		this.battlefield.forEach(card => {
			card.tapped = true;
		});
	}

	untapAll() {
		this.battlefield.forEach(card => {
			if (!card.disableUntap) 
				card.tapped = false;
		});
	}

	buildMenuGraveyard(close, searchGraveyard) {
		this.menuBoard = new Menu({
			classes: "round bg"
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "Search",
				icon: Icons.search,
				click: () => {
					searchGraveyard();
					close();
				}
			}),
		)
	}

	buildMenuExile(close, searchExile) {
		this.menuBoard = new Menu({
			classes: "round bg"
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "Search",
				icon: Icons.search,
				click: () => {
					searchExile();
					close();
				}
			})
		)
	}

	buildMenuCounter(counter: Counter, close) {
		this.menuBoard = new Menu({
			classes: "round bg"
		});
		let save = () => {
			let value = +textboxValue.value;
			let name = textboxName.value;
			let color = textboxColor.value;
			if (value > 999) value = 999;
			counter.value = value;
			counter.name = name;
			counter.color = color;
		}
		let textboxName = new Textbox({
			value: counter.name,
			width: 160,
			label: "Name",
			placeholder: "Name...",
			change: value => {
				save();
			},
			keydownEnter: value => {
				save();
				close();
			}
		});
		let textboxValue = new Textbox({
			type: "number",
			min: 1,
			max: 999,
			width: 160,
			label: "Value",
			value: counter.value.toString(),
			change: value => {
				save();
			},
			keydownEnter: value => {
				save();
				close();
			}
		});
		let textboxColor = new Textbox({
			colorPicker: true,
			width: 160,
			value: counter.color,
			label: "Color",
			keydownEnter: value => {
				save();
				close();
			},
			change: value => {
				save();
			}
		})
		this.menuBoard.items.push(
			new MenuItem({
				textbox: textboxName
			}),
			new MenuItem({
				textbox: textboxValue
			}),
			new MenuItem({
				textbox: textboxColor
			}),
			new MenuItem({
				button: new Button({
					icon: Icons.trash,
					text: "Delete",
					click: () => {
						if (confirm("Are you sure you want to delete this counter?")) {
							this.counters = this.counters.filter(_counter => {
								return _counter.id !== counter.id
							});
							close();
						}
					}
				})
			})
		);
	}

	filterOverlayCards() {
		let value = this.textboxOverlay.value;
		this.overlayCardsFiltered = this.overlayCards.filter(card => {
			return card.card.name.toLowerCase().includes(value.toLowerCase()) ||
			card.card.type.toLowerCase().includes(value.toLowerCase());
		});
	}
	
	buildMenuLibrary(close, searchDeck) {
		this.menuBoard = new Menu({
			classes: "round bg"
		});
		let textboxDrawX = new Textbox({
			type: "number",
			width: 80,
			min: 1,
			max: this.library.length,
			value: "1",
			keydownEnter: (value) => {
				let count = +value;
				this.drawCards(count);
				close();
			},
		});
		let textboxViewX = new Textbox({
			type: "number",
			width: 80,
			min: 1,
			max: this.library.length,
			value: "1",
			keydownEnter: (value) => {
				let count = +value;
				let cards = this.getCardsFromSide(count, Sides.top, this.library);
				this.overlayCards = cards;
				this.overlayCardsFiltered = this.overlayCards;
				this.showOverlayCards = true;
				this.overlaySource = BoardZone.library;
				close();
			},
		});
		let textboxMillX = new Textbox({
			type: "number",
			width: 80,
			min: 1,
			max: this.library.length,
			value: "1",
			keydownEnter: (value) => {
				let count = +value;
				this.millCards(count);
				close();
			}
		})
		this.menuBoard.items.push(
			new MenuItem({
				text: "Draw X...",
				icon: Icons.hand,
				click: () => {
					this.menuBoard.clearActive();
				},
				menu: new Menu({
					items: [
						new MenuItem({
							textbox: textboxDrawX,
							button: new Button({
								icon: Icons.arrowRight,
								click: () => {
									let count = +textboxDrawX.value;
									this.drawCards(count);
									close();
								}
							})
						})
					]
				})
			}),
			new MenuItem({
				text: "View X...",
				icon: Icons.eye,
				// click: () => {
				// 	let card = this.getCardFromSide(Sides.top, this.library);
				// 	this.overlayCard = card;
				// 	close();
				// }
				click: () => {
					this.menuBoard.clearActive();
				},
				menu: new Menu({
					items: [
						new MenuItem({
							textbox: textboxViewX,
							button: new Button({
								icon: Icons.arrowRight,
								click: () => {
									let count = +textboxViewX.value;
									let cards = this.getCardsFromSide(count, Sides.top, this.library);
									this.overlayCards = cards;
									this.overlayCardsFiltered = this.overlayCards;
									this.showOverlayCards = true;
									this.overlaySource = BoardZone.library;
									close();
								}
							})
						}),
					]
				})
			}),
			new MenuItem({
				text: "Mill X...",
				icon: Icons.graveyard,
				click: () => {
					this.menuBoard.clearActive();
				},
				menu: new Menu({
					items: [
						new MenuItem({
							textbox: textboxMillX,
							button: new Button({
								icon: Icons.arrowRight,
								click: () => {
									let count = +textboxMillX.value;
									this.millCards(count);
									close();
								}
							})
						})
					]
				})
			}),
			new MenuItem({
				text: "Move to...",
				icon: Icons.arrowRight,
				click: () => {
					this.menuBoard.clearActive();
				},
				menu: new Menu({
					classes: "anchor-right",
					items: [
						new MenuItem({
							text: "Hand",
							icon: Icons.hand,
							click: () => {
								let card = this.removeCardFromSide(Sides.top, this.library);
								this.moveCardTo(card, Sides.bottom, this.hand);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.hand,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Battlefield",
							icon: Icons.swords,
							click: () => {
								let card = this.removeCardFromSide(Sides.top, this.library);
								this.moveCardTo(card, Sides.top, this.battlefield);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.battlefield,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Battlefield Face-Down",
							icon: Icons.repeat,
							click: () => {
								let card = this.removeCardFromSide(Sides.top, this.library);
								card.flipped = true;
								this.moveCardTo(card, Sides.top, this.battlefield);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.battlefield,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Bottom of Library",
							icon: Icons.bottom,
							click: () => {
								let card = this.removeCardFromSide(Sides.top, this.library);
								this.moveCardTo(card, Sides.bottom, this.library);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.library,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Graveyard",
							icon: Icons.graveyard,
							click: () => {
								let card = this.removeCardFromSide(Sides.top, this.library);
								this.moveCardTo(card, Sides.top, this.graveyard);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.graveyard,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Exile",
							icon: Icons.exile,
							click: () => {
								let card = this.removeCardFromSide(Sides.top, this.library);
								this.moveCardTo(card, Sides.top, this.exile);
								close();
							}
						})
					]
				})
			}),
			new MenuItem({
				text: "Shuffle",
				icon: Icons.shuffle,
				click: () => {
					this.library = this.shuffle(this.library);
					close();
				}
			}),
			new MenuItem({
				text: "Search",
				icon: Icons.search,
				click: () => {
					searchDeck();
					close();
				}
			}),
			new MenuItem({
				text: "Reveal",
				icon: Icons.eye,
				click: () => {
					close();
				}
			}),
		)
	}

	buildMenuBattlefield(close, showTokens) {
		this.menuBoard = new Menu({
			classes: "round bg",
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "Tap All",
				icon: Icons.tap,
				classes: "icon-tap",
				click: () => {
					this.tapAll();
					close();
				}
			}),
			new MenuItem({
				text: "Untap All",
				icon: Icons.untap,
				click: () => {
					this.untapAll();
					close();
				}
			}),
			new MenuItem({
				text: "Add token",
				icon: Icons.plus,
				click: () => {
					showTokens();
					close();
				}
			}),
			new MenuItem({
				text: "Add counter",
				icon: Icons.plus,
				click: () => {
					this.addCounter();
					close();
				}
			})
		);
	}

	addCounter() {
		this.counters.push(new Counter({
			x: this.centerX,
			y: this.centerY,
			value: 1,
			id: this.randomNumber(1, 1000)
		}));
	}

	buildMenuCommandZone(card: GameCard, close) {
		this.menuBoard = new Menu({
			classes: "round bg"
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "View",
				icon: Icons.eye,
				click: () => {
					this.overlayCard = card;
					close();
				}
			}),
			new MenuItem({
				text: "Move to...",
				icon: Icons.arrowRight,
				menu: new Menu({
					classes: "anchor-bottom",
					items: [
						new MenuItem({
							text: "Battlefield",
							icon: Icons.swords,
							click: () => {
								card.x = this.centerX;
								card.y = this.centerY;
								let result = this.moveCard(card, this.commandZone, Sides.top, this.battlefield);
								this.commandZone = result.from;
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.commandZone,
										to: BoardZone.battlefield,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
					]
				})
			})
		)
	}

	buildMenuHand(close) {
		this.menuBoard = new Menu({
			classes: "round bg",
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "Discard All Cards",
				icon: Icons.graveyard,
				click: () => {
					if (confirm("Are you sure you want to discard your hand?")) {
						this.discardHand();
					}
					close();
				}
			}),
			new MenuItem({
				text: "Reveal All cards",
				icon: Icons.eye,
				click: () => {
					this.overlayCards = this.hand;
					this.overlayCardsFiltered = this.overlayCards;
					this.showOverlayCards = true;
					this.overlaySource = BoardZone.hand;
					close();
				}
			})
		)
	}

	buildMenuOverlayCard(card: GameCard, close) {
		this.menuBoard = new Menu({
			classes: "round bg"
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "View",
				icon: Icons.eye,
				click: () => {
					this.overlayCard = card;
					close();
				}
			}),
			new MenuItem({
				text: "Move to...",
				icon: Icons.arrowRight,
				menu: new Menu({
					classes: "anchor-top",
					items: [
						new MenuItem({
							text: "Battlefield",
							icon: Icons.swords,
							click: () => {
								card.x = this.centerX;
								card.y = this.centerY;
								let result = this.moveCard(card, this.library, Sides.top, this.battlefield);
								this.library = result.from;
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.battlefield,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Battlefield Face-down",
							icon: Icons.repeat,
							click: () => {
								card.x = this.centerX;
								card.y = this.centerY;
								card.flipped = true;
								let result = this.moveCard(card, this.library, Sides.top, this.battlefield);
								this.library = result.from;
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.battlefield,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Bottom of Library",
							icon: Icons.bottom,
							click: () => {
								let result = this.moveCard(card, this.library, Sides.bottom, this.library);
								this.library = result.from;
								this.library = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.library,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Graveyard",
							icon: Icons.graveyard,
							click: () => {
								let result = this.moveCard(card, this.library, Sides.top, this.graveyard);
								this.library = result.from;
								this.graveyard = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.graveyard,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Exile",
							icon: Icons.exile,
							click: () => {
								let result = this.moveCard(card, this.library, Sides.top, this.exile);
								this.library = result.from;
								this.exile = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.library,
										to: BoardZone.exile,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						})
					]
				})
			})
		)
	}

	buildMenuHandCard(card: GameCard, close) {
		this.menuBoard = new Menu({
			classes: "round bg",
		});
		this.menuBoard.items.push(
			new MenuItem({
				text: "View",
				icon: Icons.eye,
				click: () => {
					this.overlayCard = card;
					close();
				}
			}),
			new MenuItem({
				text: "Move to...",
				icon: Icons.arrowRight,
				menu: new Menu({
					classes: "anchor-bottom",
					items: [
						new MenuItem({
							text: "Battlefield",
							icon: Icons.swords,
							click: () => {
								card.x = this.centerX;
								card.y = this.centerY;
								let result = this.moveCard(card, this.hand, Sides.top, this.battlefield);
								this.hand = result.from;
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.hand,
										to: BoardZone.battlefield,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Battlefield Face-down",
							icon: Icons.repeat,
							click: () => {
								card.x = this.centerX;
								card.y = this.centerY;
								card.flipped = true;
								let result = this.moveCard(card, this.hand, Sides.top, this.battlefield);
								this.hand = result.from;
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.hand,
										to: BoardZone.battlefield,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Top of Library",
							icon: Icons.top,
							click: () => {
								let result = this.moveCard(card, this.hand, Sides.top, this.library);
								this.hand = result.from;
								this.library = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.hand,
										to: BoardZone.library,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Bottom of Library",
							icon: Icons.bottom,
							click: () => {
								let result = this.moveCard(card, this.hand, Sides.bottom, this.library);
								this.hand = result.from;
								this.library = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.hand,
										to: BoardZone.library,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Shuffle into Library",
							icon: Icons.shuffle,
							click: () => {
								let result = this.moveCard(card, this.hand, Sides.top, this.library);
								this.hand = result.from;
								this.library = result.to;
								this.library = this.shuffle(this.library);
								close();

								// TODO: Shuffle on client then update observers via socket.io of new order
							}
						}),
						new MenuItem({
							text: "Graveyard",
							icon: Icons.graveyard,
							click: () => {
								let result = this.moveCard(card, this.hand, Sides.top, this.graveyard);
								this.hand = result.from;
								this.graveyard = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.hand,
										to: BoardZone.graveyard,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Exile",
							icon: Icons.exile,
							click: () => {
								let result = this.moveCard(card, this.hand, Sides.top, this.exile);
								this.hand = result.from;
								this.exile = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.hand,
										to: BoardZone.exile,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						})
					]
				})
			})
		)
	}

	buildMenuBattlefieldCard(card: GameCard, close) {
		this.menuBoard = new Menu({
			classes: "round bg",
		});
		if (card.tapped) {
			this.menuBoard.items.push(
				new MenuItem({
					text: "Untap",
					icon: Icons.untap,
					disabled: card.disableUntap,
					click: () => {
						card.tapped = false;
						close();
								
						this.gameUpdate(new GameUpdate({
							data: new GameUpdateCard({
								card: card,
								from: BoardZone.battlefield,
								type: GameUpdateCardType.untap
							}),
							gameAction: GameAction.cardUpdated,
							viewId: this.viewId,
							player: this.player
						}));
					}
				})
			);
		}
		else {
			this.menuBoard.items.push(
				new MenuItem({
					text: "Tap",
					icon: Icons.tap,
					classes: "icon-tap",
					click: () => {
						card.tapped = true;
						close();
								
						this.gameUpdate(new GameUpdate({
							data: new GameUpdateCard({
								card: card,
								from: BoardZone.battlefield,
								type: GameUpdateCardType.tap
							}),
							gameAction: GameAction.cardUpdated,
							viewId: this.viewId,
							player: this.player
						}));
					}
				})
			);
		}
		this.menuBoard.items.push(
			new MenuItem({
				text: "Flip",
				icon: Icons.repeat,
				click: () => {
					card.flipped = !card.flipped;
					close();
								
					this.gameUpdate(new GameUpdate({
						data: new GameUpdateCard({
							card: card,
							from: BoardZone.battlefield,
							type: GameUpdateCardType.flip
						}),
						gameAction: GameAction.cardUpdated,
						viewId: this.viewId,
						player: this.player
					}));
				}
			}),
			new MenuItem({
				text: "Rotate",
				icon: Icons.levelDown,
				click: () => {
					card.rotated = !card.rotated;
					close();
								
					this.gameUpdate(new GameUpdate({
						data: new GameUpdateCard({
							card: card,
							from: BoardZone.battlefield,
							type: GameUpdateCardType.rotate
						}),
						gameAction: GameAction.cardUpdated,
						viewId: this.viewId,
						player: this.player
					}));
				}
			}),
			new MenuItem({
				text: "Clone",
				icon: Icons.clone,
				click: () => {
					let clone = JSON.parse(JSON.stringify(card));
					this.moveCardTo(clone, Sides.top, this.battlefield);
					clone.x = card.x + 2;
					clone.y = card.y + 4;

					close();
								
					this.gameUpdate(new GameUpdate({
						data: new GameUpdateCard({
							card: card,
							from: BoardZone.battlefield,
							type: GameUpdateCardType.clone
						}),
						gameAction: GameAction.cardUpdated,
						viewId: this.viewId,
						player: this.player
					}));
				}
			}),
			new MenuItem({
				text: "View",
				icon: Icons.eye,
				click: () => {
					this.overlayCard = card;
					close();
				}
			}),
			new MenuItem({
				text: card.disableUntap ? "Enable Untap" : "Disable Untap",
				icon: card.disableUntap ? Icons.unlock : Icons.lock,
				click: () => {
					card.disableUntap = !card.disableUntap;
					close();
				}
			}),
			new MenuItem({
				text: "Arrange...",
				icon: Icons.sort,
				menu: new Menu({
					classes: "anchor-bottom",
					items: [
						new MenuItem({
							text: "Bring Forward",
							icon: Icons.moveForward,
							click: () => {
								let index = this.battlefield.indexOf(card);
								this.battlefield = this.moveCardForward(card, this.battlefield);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.battlefield,
										toIndex: index - 1
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Bring to Front",
							icon: Icons.moveTop,
							click: () => {
								let index = this.battlefield.indexOf(card);
								let result = this.moveCard(card, this.battlefield, Sides.top, this.battlefield);
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.battlefield,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Send Backward",
							icon: Icons.moveBackward,
							click: () => {
								let index = this.battlefield.indexOf(card);
								this.battlefield = this.moveCardBackward(card, this.battlefield);
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.battlefield,
										toIndex: index + 1
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Send to Back",
							icon: Icons.moveBottom,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.bottom, this.battlefield);
								this.battlefield = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.battlefield,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						})
					]
				})
			}),
			new MenuItem({
				text: "Move to...",
				icon: Icons.arrowRight,
				menu: new Menu({
					classes: "anchor-bottom",
					items: [
						new MenuItem({
							text: "Top of Library",
							icon: Icons.top,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.top, this.library);
								this.battlefield = result.from;
								this.library = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.library,
										toSide: Sides.top
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Bottom of Library",
							icon: Icons.bottom,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.bottom, this.library);
								this.battlefield = result.from;
								this.library = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.library,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Shuffle into Library",
							icon: Icons.shuffle,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.top, this.library);
								this.battlefield = result.from;
								this.library = result.to;
								this.library = this.shuffle(this.library);
								close();
								
								// Todo: socket.io update
							}
						}),
						new MenuItem({
							text: "Hand",
							icon: Icons.hand,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.bottom, this.hand);
								this.battlefield = result.from;
								this.hand = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.hand,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Graveyard",
							icon: Icons.graveyard,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.top, this.graveyard);
								this.battlefield = result.from;
								this.graveyard = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.graveyard,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						}),
						new MenuItem({
							text: "Exile",
							icon: Icons.exile,
							click: () => {
								let result = this.moveCard(card, this.battlefield, Sides.top, this.exile);
								this.battlefield = result.from;
								this.exile = result.to;
								close();
								
								this.gameUpdate(new GameUpdate({
									data: new GameUpdateCardMoved({
										card: card,
										from: BoardZone.battlefield,
										to: BoardZone.exile,
										toSide: Sides.bottom
									}),
									gameAction: GameAction.cardMoved,
									viewId: this.viewId,
									player: this.player
								}));
							}
						})
					]
				})
			}),
			new MenuItem({
				text: "Counters...",
				icon: Icons.counters,
				menu: new Menu({
					classes: "anchor-bottom",
					items: [
						new MenuItem({
							text: "Coming soon..."
						})
					]
				})
			}),
		);
	}
}