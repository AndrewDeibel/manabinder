import { Injectable } from '@angular/core';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { AlertType } from '@app/controls/alert';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { BinderResults, SearchBindersParams } from '../collection/collection-binders/collection-binders.service';
import { APIResponse } from '@app/models/api-response';
import { Binder } from './binder/binder';
import { environment } from 'src/environments/environment';

export interface AddBinder {
	name: string;
	metadata: string;
	public: boolean;
	trades: boolean;
}
export interface DeleteBinder {
	binder_id: number;
}
export interface AddBinderCards {
	user_cards: string;
	user_binder_id: number;
}
export interface RemoveBinderCard {
	user_binder_id: number;
	user_card_id: number;
}

@Injectable({
	providedIn: 'root'
})

export class BindersService {

	constructor(
		private notificationService: NotificationsService,
		private http: HttpClient
	) {}

	// Search binders
	private searchBindersSubject = new BehaviorSubject<BinderResults>(null);
	searchBindersObservable() {
		this.searchBindersSubject = new BehaviorSubject<BinderResults>(null);
		return this.searchBindersSubject.asObservable();
	}
	searchBinders(params: SearchBindersParams) {
		this.http.post<APIResponse>(environment.api + "binders/all", params).subscribe(res => {
			if (res.data.binders) {
				let binders: Binder[] = [];
				res.data.binders.forEach(binder => {
					binders.push(new Binder(binder));
				});
				let result: BinderResults = {
					binders: binders,
					total_pages: res.data.total_pages,
					total_results: res.data.total_results
				};
				this.searchBindersSubject.next(result);
			}
		});
	}

	// Add binder
	private addBinderSubject = new BehaviorSubject<Binder>(null);
	addBinderObservable() {
		this.addBinderSubject = new BehaviorSubject<Binder>(null);
		return this.addBinderSubject.asObservable();
	}
	addBinder(params: AddBinder) {
		this.http.post<APIResponse>(environment.api + "binders/create", params).subscribe(res => {
			if (res.success) {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Added ${params.name} binder to collection`
					})
				]);
				let binder = new Binder(res.data);
				this.addBinderSubject.next(binder);
			}
		});
	}

	// Get binder
	private getBinderSubject = new BehaviorSubject<Binder>(null);
	getBinderObservable() {
		this.getBinderSubject = new BehaviorSubject<Binder>(null);
		return this.getBinderSubject.asObservable();
	}
	getBinder(id: number) {
		this.http.get<APIResponse>(environment.api + "binders/" + id).subscribe(res => {
			this.getBinderSubject.next(new Binder(res.data));
		})
	}

	// Add card to binder
	private addBinderCardsSubject = new BehaviorSubject<boolean>(false);
	addBinderCardsObservable() {
		this.addBinderCardsSubject = new BehaviorSubject<boolean>(false);
		return this.addBinderCardsSubject.asObservable();
	}
	addBinderCards(params: AddBinderCards) {
		this.http.post<APIResponse>(environment.api + "binders/add-card", params).subscribe(res => {
			if (res.data === "success") {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Added ${JSON.parse(params.user_cards).length} card(s) to binder`
					})
				])
				this.addBinderCardsSubject.next(true);
			}
		});
	}

	// Remove card from binder
	private removeBinderCardSubject = new BehaviorSubject<Binder>(null);
	removeBinderCardObservable() {
		this.removeBinderCardSubject = new BehaviorSubject<Binder>(null);
		return this.removeBinderCardSubject.asObservable();
	}
	removeBinderCard(params: RemoveBinderCard) {
		this.http.post<APIResponse>(environment.api + "binders/remove-card", params).subscribe(res => {
			this.notificationService.addNotifications([
				new Notification({
					alertType: AlertType.success,
					message: `Removed 1 card from binder`
				})
			]);
			this.removeBinderCardSubject.next(new Binder(res.data));
		})
	}

	// Delete binder
	private deleteBinderSubject = new BehaviorSubject<boolean>(null);
	deleteBinderObservable() {
		this.deleteBinderSubject = new BehaviorSubject<boolean>(null);
		return this.deleteBinderSubject.asObservable();
	}
	deleteBinder(params: DeleteBinder) {
		this.http.post<APIResponse>(environment.api + "binders/delete", params).subscribe(res => {
			this.notificationService.addNotifications([
				new Notification({
					alertType: AlertType.success,
					message: `Removed binder`
				})
			]);
			this.deleteBinderSubject.next(true);
		});
	}

}