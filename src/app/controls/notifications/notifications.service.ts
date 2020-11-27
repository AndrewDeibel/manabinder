import { Injectable } from '@angular/core';
import { Notification } from './notification';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class NotificationsService {

	constructor() { }

	// Notifications
	private notificationsSubject = new BehaviorSubject<Notification[]>([]);
	notificationsObservable() {
		this.notificationsSubject = new BehaviorSubject<Notification[]>([]);
		return this.notificationsSubject.asObservable();
	}
	addNotifications(notifications: Notification[]) {
		let currentValue = this.notificationsSubject.value;
		notifications.forEach(notification => {
			currentValue.push(notification);
		})
		this.notificationsSubject.next(currentValue);
	}
	
	// get notifications() {
	// 	return this._notifications;
	// }
	// set notifications(notifications: Notification[]) {
	// 	notifications.forEach(notification => {
	// 		this._notifications.push(notification);
	// 	});
	// }
	
	// getNotifications() {
	// 	return this._notifications;
	// }

	// addNotifications(notifications: Notification[]) {
	// 	notifications.forEach(notification => {
	// 		this._notifications.push(notification);
	// 	});
	// }
	
}