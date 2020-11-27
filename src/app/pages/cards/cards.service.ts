import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@app/../environments/environment';
import { APIResponse } from '@app/models';
import { Card, UserCard } from '@app/pages/cards/card/card';

export interface GetAllCardsParams {
    page: number;
    page_size: number;
    sort_by: string; //sortByDirection
    language_id: number;
}

export interface SearchCardsParams {
    page: number;
    page_size: number;
    language_id: number;
    sort_by: string; //sortByDirection
    query: string;
}

export interface CardResults {
	total_value?: number;
	total_results: number;
	total_pages: number;
	cards?: Card[];
	userCards?: UserCard[];
}

@Injectable({ providedIn: 'root' })
export class CardsService {

	constructor(private http: HttpClient) {}

	// Search
    private searchCardsSubject = new BehaviorSubject<CardResults>(null);
    searchCardsObservable() {
		this.searchCardsSubject = new BehaviorSubject<CardResults>(null);
		return this.searchCardsSubject.asObservable();
	}
    searchCards(params: SearchCardsParams) {
        this.http.post<APIResponse>(environment.api + "cards/quicksearch", params).subscribe(res => {
			let cards: Card[] = [];
			res.data.cards.forEach(card => {
				cards.push(new Card(card));
			});
			let results: CardResults = {
				cards: cards,
				total_pages: res.data.total_pages,
				total_results: res.data.total_results
			}
			this.searchCardsSubject.next(results);
        });
	}
	
	// Auto complete
	private autoCompleteCardsSubject = new BehaviorSubject<Card[]>([]);
	autoCompleteCardsObservable() {
		this.autoCompleteCardsSubject = new BehaviorSubject<Card[]>([]);
		return this.autoCompleteCardsSubject.asObservable();
	}
    autoCompleteCards(params: SearchCardsParams) {
        this.http.post<APIResponse>(environment.api + "cards/quicksearch", params).subscribe(res => {
			let cards: Card[] = [];
			res.data.cards.forEach(card => {
				cards.push(new Card(card));
			});
			this.autoCompleteCardsSubject.next(cards);
		});
	}

	// Get all
	private allCardsSubject = new BehaviorSubject<CardResults>(null);
	allCardsObservable() {
		this.allCardsSubject = new BehaviorSubject<CardResults>(null);
		return this.allCardsSubject.asObservable();
	}
    allCards(params: GetAllCardsParams) {
		this.http.post<APIResponse>(environment.api + "cards/all", params).subscribe(res => {
			let cards: Card[] = [];
			res.data.cards.forEach(card => {
				cards.push(new Card(card));
			});
			let results: CardResults = {
				cards: cards,
				total_pages: res.data.total_pages,
				total_results: res.data.total_results
			}
			this.allCardsSubject.next(results);
		});
	}

	
	// Get id
	private cardSubject = new BehaviorSubject<Card>(null);
	public getCardValue () {
		return this.cardSubject.value;
	}
	cardObservable() {
		return this.cardSubject.asObservable();
	}
	clearCardObservable() {
		this.cardSubject = new BehaviorSubject<Card>(null);
	}
	card(id: number) {
		this.http.get<APIResponse>(environment.api + "card/id/" + id).subscribe(res => {
			this.cardSubject.next(new Card(res.data));
		});
	}

}