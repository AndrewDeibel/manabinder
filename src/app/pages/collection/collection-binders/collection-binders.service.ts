import { Binder } from '@app/pages/binders/binder/binder';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { AlertType } from '@app/controls/alert';
import { BehaviorSubject } from 'rxjs';
import { APIResponse } from '@app/models';
import { environment } from 'src/environments/environment';

export interface BinderResults {
	total_results: number;
	total_pages: number;
	binders: Binder[];
}

export interface SearchBindersParams {
	user_id?: number;
	page: number;
	page_size: number;
	sort_by: string;
	sort_direction: string;
	query: string;
}

export interface AddBinderParams {
	name: string,
	metadata: string,
	public: boolean;
	trades: boolean;
	//short_description: string;
	//tags: string;
}

export interface AddCollectionBinderCardsParams {
	user_cards: number[];
	user_binder_id: number;
}

export interface UpdateBinder {
	name: string;
	metadata: string;
	public: boolean;
	trades: boolean;
	binder_id: number;
}

@Injectable({
	providedIn: 'root'
})
export class CollectionBindersService {

	constructor(
		private http: HttpClient,
		private notificationService: NotificationsService
	) { }
	
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
				let binderResults: BinderResults = {
					binders: binders,
					total_pages: res.data.total_pages,
					total_results: res.data.total_results
				};
				this.searchBindersSubject.next(binderResults);
			}
		})
	}

	// Add binder
	private addBinderSubject = new BehaviorSubject<Binder>(null);
	addBinderObservable() {
		this.addBinderSubject = new BehaviorSubject<Binder>(null);
		return this.addBinderSubject.asObservable();
	}
	addBinder(params: AddBinderParams) {
		this.http.post<APIResponse>(environment.api + "binders/create", params).subscribe(res => {
			if (res.success) {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Added ${params.name} binder to collection`
					})
				]);
				let binder = new Binder({
					created_at: res.data.created_at,
					id: res.data.id,
					updated_at: res.data.updated_at
				});
				this.addBinderSubject.next(binder);
			}
		})
	}

	// Update binder
	private updateBinderSubject = new BehaviorSubject<Binder>(null);
	updateBinderObserable() {
		this.updateBinderSubject = new BehaviorSubject<Binder>(null);
		return this.updateBinderSubject.asObservable();
	}
	updateBinder(params: UpdateBinder) {
		this.http.post<APIResponse>(environment.api + "binders/update", params).subscribe(res => {
			if (res.success) {
				this.notificationService.addNotifications([
					new Notification({
						alertType: AlertType.success,
						message: `Updated binder ${params.name}`
					})
				]);
				let binder = new Binder({
					created_at: res.data.created_at,
					id: res.data.id,
					updated_at: res.data.updated_at
				});
				this.updateBinderSubject.next(binder);
			}
		});
	}
}