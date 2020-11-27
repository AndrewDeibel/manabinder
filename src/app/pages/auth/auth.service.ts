import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { User } from '@app/models/user';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUserObservable: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUserObservable = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.http.post<any>(environment.api + 'login', { email, password })
            .pipe(map(res => {
				// store user details and jwt token in local storage to keep user logged in between page refreshes
				let user: User = new User(res.data.user);
				user.token = res.data.token;
				user.expires_at = res.data.expires_at;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            }));
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
		this.currentUserSubject.next(null);
		location.reload(true);
	}
	
	register(email: string, username: string, password: string, password_confirmation: string) {
		return this.http.post<any>(environment.api + 'register', { email, username, password, password_confirmation })
			.pipe(map(res => {
				let user: User = new User(res.data.user);
				user.token = res.data.token;
				localStorage.setItem('currentUser', JSON.stringify(user));
				this.currentUserSubject.next(user);
			}));
	}
}