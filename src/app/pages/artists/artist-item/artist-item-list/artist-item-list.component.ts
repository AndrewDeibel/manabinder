import { Component, OnInit, Input } from '@angular/core';
import { Artist } from '../../artist/artist';

@Component({
	selector: 'mb-artist-item-list',
	templateUrl: 'artist-item-list.component.html',
	styleUrls: ['./artist-item-list.component.scss']
})

export class ArtistItemListComponent implements OnInit {
	
	@Input() artist: Artist;

	constructor() { }

	ngOnInit() { }
}