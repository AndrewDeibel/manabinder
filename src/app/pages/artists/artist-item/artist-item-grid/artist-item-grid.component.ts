import { Component, OnInit, Input } from '@angular/core';
import { Artist } from '../../artist/artist';

@Component({
	selector: 'mb-artist-item-grid',
	templateUrl: 'artist-item-grid.component.html',
	styleUrls: ['./artist-item-grid.component.scss']
})

export class ArtistItemGridComponent implements OnInit {

	@Input() artist: Artist;

	constructor() { }

	ngOnInit() { }
}