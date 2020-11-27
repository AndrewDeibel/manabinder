import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@app/../environments/environment';

import { APIResponse } from '@app/models/api-response';
import { ScannerList } from '@app/pages/scanner/scanner-lists/scanner-list/scanner-list';
import { Card } from '@app/pages/cards/card';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { AlertType } from '@app/controls/alert/alert';

export enum ScanType {
	scan = "scan",
	multiple = "scan_multiple",
	snapshot = "snapshot"
}

export interface GetScanCardParams {
	image: string;
}

export interface GetScanCardsParams {
	image: string;
}

@Injectable({
    providedIn: 'root'
})

export class ScannerService {

    constructor(
		private http: HttpClient,
		private notificationService: NotificationsService) {}

	// TempId
	private tempId = 0;
	getTempId() {
		return this.tempId++;
	}

	// Scan single card
	private scanCardSubject = new BehaviorSubject<Card>(null);
    getScanCardObservable() {
		this.scanCardSubject = new BehaviorSubject<Card>(null);
		return this.scanCardSubject.asObservable();
	}
    getScanCard(params: GetScanCardParams) {
        this.http.post<APIResponse>(environment.api + "scanner/detect", params).subscribe(res => {
			if (res.success) {
				let card = new Card(res.data.card);
				if (card.id > 0) {
					this.scanCardSubject.next(card);
				}
			}
			else {
				this.scanCardSubject.next(null);
			}
		});
	}

	// Scan mutiple cards
	private scanCardsSubject = new BehaviorSubject<Card[]>([]);
	getScanCardsObservable() {
		this.scanCardsSubject = new BehaviorSubject<Card[]>([])
		return this.scanCardsSubject.asObservable();
	}
	getScanCards(params: GetScanCardsParams) {
		this.http.post<APIResponse>(environment.api + "scanner/multiple", params).subscribe(res => {
			if (res.success && res.data.length > 0) {
				let cards: Card[] = [];
				res.data.forEach(card => {
					let _card = new Card(card);
					if (_card.id > 0) {
						cards.push(_card);
					}
				});
				this.scanCardsSubject.next(cards);
			}
			else {
				this.scanCardsSubject.next([]);
			}
		});
	}
	
	// Scan cache
	private _scannerList: ScannerList = new ScannerList();
	get scannerList() {
		return this._scannerList;
	}
	set scannerList(scannerList) {
		this._scannerList = scannerList;
	}

	// Clear cache
	clearScans() {
		this._scannerList = new ScannerList();
	}

	// Scan cache
	private scansSubject = new BehaviorSubject<Card[]>([]);
	getScansObservable() {
		this.scansSubject = new BehaviorSubject<Card[]>([]);
		return this.scansSubject.asObservable();
	}
	getScans() {
		this.scansSubject.next(this._scannerList.cards);
	}

	changeVersion(cardOld: Card, cardNew: Card) {
		

		// Remove old card via tempId
		// this._scannerList.cards = this._scannerList.cards.filter(card => {
		// 	return card.tempId != cardOld.tempId;
		// });
		let updatedScannerListCards: Card[] = [];
		this._scannerList.cards.forEach(card => {
			if (card.tempId === cardOld.tempId) {
				updatedScannerListCards.push(cardNew);
			}
			else {
				updatedScannerListCards.push(card);
			}
		});


		this._scannerList.cards = updatedScannerListCards;

		// Add new card
		//cardNew.tempId = cardOld.tempId++;
		//this._scannerList.cards.push(cardNew);

		// Update subscriptions
		this.scansSubject.next(this._scannerList.cards);
	}

	removeCard(card: Card) {
		this._scannerList.cards = this._scannerList.cards.filter(_card => {
			return _card.tempId != card.tempId;
		});

		// Update subscriptions
		this.scansSubject.next(this._scannerList.cards);

		this.notificationService.addNotifications([
			new Notification({
				alertType: AlertType.success,
				message: "Removed " + card.name + " from results"
			})
		]);
	}

}