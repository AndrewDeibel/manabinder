import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { AlertType } from '@app/controls/alert/alert';

@Injectable({ providedIn: 'root' })
export class ErrorIntercept implements HttpInterceptor {

	constructor(
		private authenticationService: AuthenticationService,
		private notificationService: NotificationsService) {}
	
    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request)
            .pipe(
                //retry(1),
                catchError((error: HttpErrorResponse) => {

                    let message = '';
                    if (error.error instanceof ErrorEvent) {
                        // client-side error
                        message = error.error.message;
                    } else {
						// server-side error
						if (error.error && error.error.data) {
							message = error.error.data;
						}
						else if (error.error && error.error.errors) {
							for (let prop in error.error.errors) {
								if (Object.prototype.hasOwnProperty.call(error.error.errors, prop)) {
									message = error.error.errors[prop][0];
								}
							}
						}
						else if (error.error && error.error.message) {
							message = error.error.message;
						}
						else {
							message = error.message;
						}
                    }

					// Auto logout if 401 response returned from api
					switch (error.status) {
						case 401:
							this.authenticationService.logout();
							break;
						case 429:
							this.notificationService.addNotifications([new Notification({
								alertType: AlertType.error,
								message: "Too many requests, try again later"
							})]);
							break;
						default:
							this.notificationService.addNotifications([new Notification({
								alertType: AlertType.error,
								message: message
							})])
					}

                    return throwError(message);
                })
            )
    }
}