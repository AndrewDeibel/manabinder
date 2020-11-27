import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@app/../environments/environment';
import { APIResponse } from '@app/models/api-response';
import { Card, UserCard } from '@app/pages/cards/card/card';
import { CardResults } from '@app/pages/cards/cards.service';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { AlertType } from '@app/controls/alert/alert';

export interface SearchCollectionCardsParams {
    page: number;
    page_size: number;
    sort_by: string;
    sort_direction: string;
    query: string;
}

@Injectable({
    providedIn: 'root'
})

export class CollectionCardsService {

	constructor(
		private http: HttpClient,
		private notificationService: NotificationsService
	) {}

	// Search cards
	private searchCollectionCardsSubject = new BehaviorSubject<CardResults>(null);
	searchCollectionCardsObservable() {
		this.searchCollectionCardsSubject = new BehaviorSubject<CardResults>(null);
		return this.searchCollectionCardsSubject.asObservable();
	}
	searchCollectionCards(params: SearchCollectionCardsParams) {
		this.http.post<APIResponse>(environment.api + "collection/all", params).subscribe(res => {
			if (res.data.cards) {
				let userCards: UserCard[] = [];
				res.data.cards.forEach(card => {
					userCards.push(new UserCard(card));
				});
				let cardResults: CardResults = {
					userCards: userCards,
					total_pages: res.data.total_pages,
					total_results: res.data.total_results,
					total_value: res.data.total_value
				};
				this.searchCollectionCardsSubject.next(cardResults);
			}
		});
	}
	
	// Add card
	private addCollectionCardsSubject = new BehaviorSubject<number[]>(null);
	addCollectionCardsObservable() {
		this.addCollectionCardsSubject = new BehaviorSubject<number[]>(null);
		return this.addCollectionCardsSubject.asObservable();
	}
	addCollectionCards(cards: Card[]) {
		if (cards.length) {
			let cardIds: {card_id: number}[] = [];
			cards.forEach(card => {
				cardIds.push({
					card_id: card.id,
				});
			});
			this.http.post<APIResponse>(environment.api + "collection/add", { cards: JSON.stringify(cardIds) }).subscribe(res => {
				if (res.success) {
					if (res.data.successes.length) {
						this.notificationService.addNotifications([
							new Notification({
								alertType: AlertType.success,
								message: "Added " + res.data.successes.length + " card(s) to collection"
							})
						]);
					}
					if (res.data.failures.length) {
						this.notificationService.addNotifications([
							new Notification({
								alertType: AlertType.error,
								message: "Error adding " + res.data.failures.length + " card(s) to collection"
							})
						]);
					}
					this.addCollectionCardsSubject.next(res.data.successes);
				}
			});
		}
	}

	// Remove card
	private removeCollectionCardsSubject = new BehaviorSubject<number[]>([]);
	removeCollectionCardsObservable() {
		this.removeCollectionCardsSubject = new BehaviorSubject<number[]>([]);
		return this.removeCollectionCardsSubject.asObservable();
	}
	removeCollectionCards(cards: UserCard[]) {
		if (cards.length) {
			let cardIds = [];
			cards.forEach((card: UserCard) => {
				cardIds.push({
					card_id: card.id,
				});
			});
			this.http.post<APIResponse>(environment.api + "collection/delete", { cards: JSON.stringify(cardIds) }).subscribe(res => {
				if (res.success) {
					if (res.data.successes.length) {
						this.notificationService.addNotifications([
							new Notification({
								alertType: AlertType.success,
								message: "Removed " + cardIds.length + " card(s) from collection"
							})
						]);
					}
					if (res.data.failures.length) {
						this.notificationService.addNotifications([
							new Notification({
								alertType: AlertType.error,
								message: "Error removing " + cardIds.length + " card(s) from collection"
							})
						]);
					}
					this.removeCollectionCardsSubject.next(cardIds);
				}
			});
		}
	}

	// Update card
	private updateCollectionCardSubject = new BehaviorSubject<UserCard>(null);
	updateCollectionCardObservable() {
		this.updateCollectionCardSubject = new BehaviorSubject<UserCard>(null);
		return this.updateCollectionCardSubject.asObservable();
	}
	updateCollectionCard(card: UserCard) {
		this.http.post<APIResponse>(environment.api + "collection/update", {
			user_card_id: card.id,
			card_id: card.card_id,
			metadata: JSON.stringify(card.metadata)
		}).subscribe(res => {
			if (res.success) {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: "Updated card details"
					})
				]);
				this.updateCollectionCardSubject.next(new UserCard(res.data));
			}
		});
	}

}