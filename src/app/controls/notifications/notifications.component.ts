import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Notification } from './notification';
import { NotificationsService } from './notifications.service';

@Component({
	selector: 'mb-notifications',
	templateUrl: 'notifications.component.html',
	styleUrls: ['./notifications.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class NotificationsComponent implements OnInit {

	notifications: Notification[] = [];

	constructor(private notificationService: NotificationsService) { }

	ngOnInit() {
		// let tempId = 0;
		// let test1 = new Notification({
		// 	alertType: AlertType.success,
		// 	message: "Added {{card.name}} to collection",
		// 	duration: 2000,
		// 	id: tempId++
		// });
		// test1.destroy = () => {
		// 	this.removeNotification(test1.id);
		// }
		// let test2 = new Notification({
		// 	alertType: AlertType.error,
		// 	message: "Error example",
		// 	id: tempId++
		// });
		// test2.destroy = () => {
		// 	this.removeNotification(test2.id);
		// }
		// this.notifications.push(test1, test2);

		this.notificationService.notificationsObservable().subscribe(notifications => {
			this.notifications = notifications;
		});
	}

	removeNotification(id: number) {
		this.notifications = this.notifications.filter(notification => {
			return notification.id != id;
		});
	}

}