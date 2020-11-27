import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { DeckResults } from '@app/pages/collection/collection-decks/collection-decks.service';
import { APIResponse } from '@app/models';
import { environment } from '@app/../environments/environment';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { Deck } from './deck/deck';
import { AlertType } from '@app/controls/alert/alert';

export interface AddDeckCardsParams {
	user_cards: string;
	user_deck_id: number;
}
export interface RemoveDeckCardParams {
	user_deck_id: number;
	user_card_id: number;
}
export interface DeleteDeckParams {
	deck_id: number;
}
export interface SearchDecks {
	user_id?: number;
	page: number;
	page_size: number;
	sort_by: string;
	sort_direction: string;
	query: string;
}

@Injectable({
	providedIn: 'root'
})

export class DecksService {

	constructor(
		private notificationService: NotificationsService,
		private http: HttpClient) {}

	// Search decks
	private searchDecksSubject = new BehaviorSubject<DeckResults>(null);
	searchDecksObservable() {
		this.searchDecksSubject = new BehaviorSubject<DeckResults>(null);
		return this.searchDecksSubject.asObservable();
	}
	searchDecks(params: SearchDecks) {
		this.http.post<APIResponse>(environment.api + "decks/all", params).subscribe(res => {
			if (res.data.decks) {
				let decks: Deck[] = [];
				res.data.decks.forEach(deck => {
					decks.push(new Deck(deck));
				});
				let result: DeckResults = {
					decks: decks,
					total_pages: res.data.total_pages,
					total_results: res.data.total_results
				};
				this.searchDecksSubject.next(result);
			}
		});
	}

	// Get deck
	private getDeckSubject = new BehaviorSubject<Deck>(null);
	public getDeckValue () {
		return this.getDeckSubject.value;
	}
	getDeckObservable() {
		this.getDeckSubject = new BehaviorSubject<Deck>(null);
		return this.getDeckSubject.asObservable();
	}
	getDeck(id: number) {
		this.http.get<APIResponse>(environment.api + "deck/" + id).subscribe(res => {
			this.getDeckSubject.next(new Deck(res.data));
		});
	}

	// Add cards to deck
	private addDeckCardsSubject = new BehaviorSubject<boolean>(false);
	addDeckCardsObservable() {
		this.addDeckCardsSubject = new BehaviorSubject<boolean>(false);
		return this.addDeckCardsSubject.asObservable();
	}
	addDeckCards(params: AddDeckCardsParams) {
		this.http.post<APIResponse>(environment.api + "decks/add-card", params).subscribe(res => {
			if (res.data === "success") {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Added ${JSON.parse(params.user_cards).length} card(s) to deck`
					})
				])
				this.addDeckCardsSubject.next(true);
			}
		});
	}

	// Remove card from deck
	private removeDeckCardSubject = new BehaviorSubject<Deck>(null);
	removeDeckCardObservable() {
		this.removeDeckCardSubject = new BehaviorSubject<Deck>(null);
		return this.removeDeckCardSubject.asObservable();
	}
	removeDeckCard(params: RemoveDeckCardParams) {
		this.http.post<APIResponse>(environment.api + "decks/remove-card", params).subscribe(res => {
			this.notificationService.addNotifications([
				new Notification({
					alertType: AlertType.success,
					message: `Removed 1 card from deck`
				})
			]);
			this.removeDeckCardSubject.next(new Deck(res.data));
		});
	}

	// Delete deck
	private deleteDeckSubject = new BehaviorSubject<boolean>(null);
	deleteDeckObservable() {
		this.deleteDeckSubject = new BehaviorSubject<boolean>(null);
		return this.deleteDeckSubject.asObservable();
	}
	deleteDeck(params: DeleteDeckParams) {
		this.http.post<APIResponse>(environment.api + "decks/delete", params).subscribe(res => {
			this.notificationService.addNotifications([
				new Notification({
					alertType: AlertType.success,
					message: `Removed deck`
				})
			]);
			this.deleteDeckSubject.next(true);
		});
	}

}