import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { CardResults, Card } from '@app/pages/cards';
import { APIResponse } from '@app/models';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class GameBoardService {

	constructor(private http: HttpClient) {}

	// Tokens
	private tokensSubject = new BehaviorSubject<Card[]>([]);
	tokensObservable() {
		this.tokensSubject = new BehaviorSubject<Card[]>([]);
		return this.tokensSubject.asObservable();
	}
	tokens() {
		this.http.get<APIResponse>(environment.api + "cards/tokens").subscribe(res => {
			let cards: Card[] = [];
			res.data.forEach(card => {
				card.token = true;
				cards.push(new Card(card));
			});
			this.tokensSubject.next(cards);
		});
	}

}