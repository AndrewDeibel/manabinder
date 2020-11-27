import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@app/../environments/environment';
import { APIResponse } from '@app/models';
import { Set } from '@app/pages/sets/set/set';
import { Card } from '@app/pages/cards/card/card';
import { CardResults } from '../cards/cards.service';

export interface GetAllSetsParams {
    page: number;
    page_size: number;
    sort_by: string;
	sort_direction: string;
	query: string;
}

export interface SearchSetCardsParams {
	set_id: number;
    page: number;
    page_size: number;
    sort_by: string;
    sort_direction: string;
    query: string;
}

export interface SearchSetsParams {
	set_id: number;
    page: number;
    page_size: number;
    sort_by: string;
    sort_direction: string;
    query: string;
}

export interface SetsResults {
	total_results: number;
	total_pages: number;
	sets?: Set[];
}

@Injectable({
    providedIn: 'root'
})

export class SetsService {

    constructor(private http: HttpClient) {}

	// Search set cards
    private searchSetCardsSubject = new BehaviorSubject<CardResults>(null);
    searchSetCardsObservable() {
		this.searchSetCardsSubject = new BehaviorSubject<CardResults>(null);
		return this.searchSetCardsSubject.asObservable()
	}
    searchSetCards(params: SearchSetCardsParams) {
        this.http.post<APIResponse>(environment.api + "set/cards", params).subscribe(res => {
			let cards: Card[] = [];
			res.data.cards.forEach(card => {
				cards.push(new Card(card));
			});
			let cardResuls: CardResults = {
				cards: cards,
				total_pages: res.data.total_pages,
				total_results: res.data.total_results
			}
			this.searchSetCardsSubject.next(cardResuls);
		});
	}

	// Get set
    private setSubject = new BehaviorSubject<Set>(null);
	setObservable() {
		this.setSubject = new BehaviorSubject<Set>(null);
		return this.setSubject.asObservable()
	}
	set(code: string) {
		this.http.get<APIResponse>(environment.api + "set/code/" + code).subscribe(res => {
			this.setSubject.next(new Set(res.data))
		});
	}

	// Get all sets
	private allSetsSubject = new BehaviorSubject<SetsResults>(null);
	allSetsObservable() {
		this.allSetsSubject = new BehaviorSubject<SetsResults>(null);
		return this.allSetsSubject.asObservable();
	}
	allSets(params: GetAllSetsParams) {
		this.http.post<APIResponse>(environment.api + "sets/all", params).subscribe(res => {
			let sets: Set[] = [];
			res.data.sets.forEach(set => {
				sets.push(new Set(set));
			});
			this.allSetsSubject.next({
				total_pages: res.data.total_pages,
				total_results: res.data.total_results,
				sets: sets,
			});
		});
	}
	
}