import { Component, OnInit, ViewChild } from '@angular/core';
import { ArtistsService } from '@app/pages/artists/artists.service';
import { ActivatedRoute } from '@angular/router';
import { Artist } from './artist';
import { Cards } from '@app/pages/cards/cards';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { CardsComponent } from '@app/pages/cards/cards.component';
import { Icons } from '@app/models/icons';
import { Title } from '@angular/platform-browser';
import { LoaderService } from '@app/controls';

@AutoUnsubscribe()
@Component({
	selector: 'mb-artist',
	templateUrl: './artist.component.html'
})

export class ArtistComponent implements OnInit {

	@ViewChild(CardsComponent) cardsComponent: CardsComponent;

	id: number;
	artist: Artist;
	cards: Cards;
	artistLoaded: boolean = false;
	artistCardsLoaded: boolean = false;

	constructor(
		private titleService: Title,
		private artistsService: ArtistsService,
		private loaderService: LoaderService,
		private route: ActivatedRoute) { }
	
	ngOnDestroy() { }
	ngOnInit(): void {

		// Init cards
		this.cards = new Cards();
		this.cards.art = true;
		this.cards.items.filter.sortBy = "released_at";
		this.cards.items.header.icon = Icons.user;

		// Get id from route
		this.route.params.subscribe(params => {
			this.id = +params["id"]

			// Request artist from service
			this.loaderService.show();
			this.artistsService.artist(this.id);

		});

		// Response from artist request
		this.artistsService.artistObservable().subscribe(artist => {
			if (artist) {
				this.artistLoaded = true;
				if (this.artistCardsLoaded)
					this.loaderService.hide();
				this.artist = artist;
				this.cards.items.header.subtitle = `cards: ${this.artist.total_cards}`;
				this.cards.items.header.title = this.artist.name;
				this.titleService.setTitle(`Mana Binder: ${this.artist.name}`);
				this.cards.items.filter.textboxSearch.placeholder = `Search ${this.artist.name} cards...`;
			}
		});

		// Response from artist cards request
		this.artistsService.searchArtistCardsObservable().subscribe(results => {
			if (results) {
				this.artistCardsLoaded = true;
				if (this.artistLoaded)
					this.loaderService.hide();
				this.cards.totalCards = results.total_results;
				this.cards.items.items = results.cards;
				this.cards.items.footer.totalPages = results.total_pages;
				this.cards.items.footer.textboxPage.max = results.total_pages;
				this.cardsComponent.setupDefaultCardsMenu();
			}
		});

	}

	getCards() {
		this.loaderService.show();
		this.artistsService.searchArtistCards({
			artist_id: this.id,
			page: this.cards.items.footer.page,
			page_size: this.cards.items.footer.pageSize,
			query: this.cards.items.filter.query,
			sort_by: this.cards.items.filter.sortBy,
			sort_direction: this.cards.items.filter.sortDirection
		});
	}
}