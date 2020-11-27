import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { BehaviorSubject } from 'rxjs';
import { APIResponse } from '@app/models';
import { environment } from 'src/environments/environment';
import { Deck } from '@app/pages/decks/deck/deck';
import { AlertType } from '@app/controls/alert/alert';

export interface DeckResults {
	total_value?: number;
	total_results: number;
	total_pages: number;
	decks?: Deck[];
}
export interface SearchCollectionDecks {
	user_id: number;
	page: number;
	page_size: number;
	sort_by: string;
	sort_direction: string;
	query: string;
}
export interface AddCollectionDeck {
	format_id: number;
	name: string;
	metadata: string;
	public: boolean;
	tags: string;
	short_description: string;
	//commander_ids: number[];
	//companion_id: number;
	achetype: string;
	power_level: number;
}
export interface AddCollectionDeckCards {
	user_cards: number[];
	user_deck_id: number;
}
export interface UpdateDeck {
	format_id: number;
	name: string;
	metadata: string;
	public: boolean;
	tags: string;
	short_description: string;
	commander_ids: string;
	companion_id: number;
	archetype: string;
	power_level: number;
	deck_id: number;
}

@Injectable({
	providedIn: 'root'
})
export class CollectionDecksService {

	constructor(
		private http: HttpClient,
		private notificationService: NotificationsService
	) { }

	// Search decks
	private searchDecksSubject = new BehaviorSubject<DeckResults>(null);
	searchDecksObservable() {
		this.searchDecksSubject = new BehaviorSubject<DeckResults>(null);
		return this.searchDecksSubject.asObservable();
	}
	searchDecks(params: SearchCollectionDecks) {
		this.http.post<APIResponse>(environment.api + "decks/all", params).subscribe(res => {
			if (res.data.decks) {
				let decks: Deck[] = [];
				res.data.decks.forEach(deck => {
					decks.push(new Deck(deck));
				});
				let deckResults: DeckResults = {
					decks: decks,
					total_pages: res.data.total_pages,
					total_results: res.data.total_results
				};
				this.searchDecksSubject.next(deckResults);
			}
		});
	}

	// Add deck
	private addDeckSubject = new BehaviorSubject<Deck>(null);
	addDeckObservable() {
		this.addDeckSubject = new BehaviorSubject<Deck>(null);
		return this.addDeckSubject.asObservable();
	}
	addDeck(params: AddCollectionDeck) {
		this.http.post<APIResponse>(environment.api + "decks/create", params).subscribe(res => {
			if (res.success) {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Added ${params.name} deck to collection`
					})
				]);
				let deck = new Deck({
					created_at: res.data.created_at,
					deck_id: res.data.id,
					id: res.data.id,
					updated_at: res.data.updated_at
				});
				this.addDeckSubject.next(deck);
			}
		});
	}

	// Update deck
	private updateDeckSubject = new BehaviorSubject<Deck>(null);
	updateDeckObservable() {
		this.updateDeckSubject = new BehaviorSubject<Deck>(null);
		return this.updateDeckSubject.asObservable();
	}
	updateDeck(params: UpdateDeck) {
		this.http.post<APIResponse>(environment.api + "decks/update", params).subscribe(res => {
			if (res.success) {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Updated deck ${params.name}`
					})
				]);
				let deck = new Deck(res.data);
				this.updateDeckSubject.next(deck);
			}
		});
	}

}