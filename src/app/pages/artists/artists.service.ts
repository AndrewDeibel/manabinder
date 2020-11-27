import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '@app/../environments/environment';
import { APIResponse } from '@app/models';
import { Artist } from '@app/pages/artists/artist/artist';
import { Card } from '@app/pages/cards/card';
import { CardResults } from '../cards';

export interface GetAllArtistsParams {
    page: number;
    page_size: number;
    sort_by: string;
	sort_direction: string;
	query: string;
}

export interface SearchArtistCardsParams {
	artist_id: number;
    page: number;
    page_size: number;
    sort_by: string;
    sort_direction: string;
    query: string;
}

export interface ArtistsResults {
	total_results: number;
	total_pages: number;
	artists?: Artist[];
}

@Injectable({
    providedIn: 'root'
})

export class ArtistsService {

    constructor(private http: HttpClient) {}

	// Search artist cards
    private searchArtistCardsSubject = new BehaviorSubject<CardResults>(null);
    searchArtistCardsObservable() {
		this.searchArtistCardsSubject = new BehaviorSubject<CardResults>(null);
		return this.searchArtistCardsSubject.asObservable();
	}
    searchArtistCards(params: SearchArtistCardsParams) {
        this.http.post<APIResponse>(environment.api + "artist/cards", params).subscribe(res => {
			let cards: Card[] = [];
			res.data.cards.forEach(card => {
				cards.push(new Card(card));
			});
			let cardResults: CardResults = {
				cards: cards,
				total_pages: res.data.total_pages,
				total_results: res.data.total_results
			};
			this.searchArtistCardsSubject.next(cardResults);
		});
	}
	
	// Get atist
	private artistSubject = new BehaviorSubject<Artist>(null);
	artistObservable() {
		this.artistSubject = new BehaviorSubject<Artist>(null);
		return this.artistSubject.asObservable();
	}
	artist(id: number) {
		this.http.get<APIResponse>(environment.api + "artist/" + id).subscribe(res => {
			this.artistSubject.next(new Artist(res.data))
		});
	}

	// Get all artists
	private allArtistsSubject = new BehaviorSubject<ArtistsResults>(null);
	allArtistsObservable() {
		this.allArtistsSubject = new BehaviorSubject<ArtistsResults>(null);
		return this.allArtistsSubject.asObservable();
	}
	allArtists(params: GetAllArtistsParams) {
		this.http.post<APIResponse>(environment.api + "artists/all", params).subscribe(res => {
			let artists: Artist[] = [];
			res.data.artists.forEach(artist => {
				artists.push(new Artist(artist));
			});
			this.allArtistsSubject.next({
				total_pages: res.data.total_pages,
				total_results: res.data.total_results,
				artists: artists
			});
		});
	}

}