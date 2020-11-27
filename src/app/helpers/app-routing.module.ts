import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth.guard';

// Pages
import {
	CardComponent,
	CardsComponent,
	DecksComponent,
	HomeComponent,
	SetsComponent,
	SetComponent,
	AuthComponent,
	ScannerComponent,
	ScannerListsComponent,
	ScannerListComponent,
	ArtistsComponent,
	ArtistComponent,
	BindersComponent,
	BinderComponent,
	CollectionCardsComponent,
	CollectionDecksComponent,
	CollectionDeckComponent,
	CollectionBindersComponent,
	CollectionBinderComponent,
	ProfileComponent,
	DashboardComponent,
	CardDetailsComponent,
	CardLegalityComponent,
	DeckComponent,
	BoardComponent,
	GameComponent,
	TrackerComponent,
} from '../pages';

const routes: Routes = [

	// Home
	{
		path: '',
		component: HomeComponent
	},

	// Playtest
	{
		path: 'playtest/:id',
		component: GameComponent,
	},

	// Cards
	{
		path: 'cards',
		//canActivate: [AuthGuard],
		component: CardsComponent,
	},
	{
		path: 'cards/:id',
		component: CardComponent,
		children: [
			{
				path: '',
				redirectTo: 'details',
				pathMatch: 'full'
			},
			{
				path: 'details',
				component: CardDetailsComponent
			},
			{
				path: 'legality',
				component: CardLegalityComponent
			}
		]
	},

	// Decks
	{
		path: 'decks',
		component: DecksComponent
	},
	{
		path: 'decks/new',
		component: CollectionDeckComponent,
	},
	{
		path: 'decks/:id',
		component: DeckComponent,
	},
	{
		path: 'decks/:id/edit',
		component: CollectionDeckComponent,
	},

	// Collection
	{
		path: 'collection/cards',
		component: CollectionCardsComponent
	},
	{
		path: 'collection/decks',
		component: CollectionDecksComponent
	},
	{
		path: 'collection/binders',
		component: CollectionBindersComponent
	},

	// Binders
	{
		path: 'binders',
		component: BindersComponent
	},
	{
		path: 'binders/new',
		component: CollectionBinderComponent
	},
	{
		path: 'binders/:id',
		component: BinderComponent
	},

	// Scanner
	{
		path: 'scanner',
		component: ScannerComponent
	},
	{
		path: 'scanner/lists',
		component: ScannerListsComponent
	},
	{
		path: 'scanner/lists/:id',
		component: ScannerListComponent
	},

	// Auth
	{
		path: 'signin',
		component: AuthComponent
	},
	{
		path: 'signup',
		component: AuthComponent
	},
	// {
	// 	path: 'verify:token'
	// },
	// {
	// 	path: 'reset:token'
	// },

	// Sets
	{
		path: 'sets',
		component: SetsComponent
	},
	{
		path: 'sets/:code',
		component: SetComponent
	},

	// Artists
	{
		path: 'artists',
		component: ArtistsComponent,
	},
	{
		path: 'artists/:id',
		component: ArtistComponent,
	},

	// Tracker
	{
		path: 'tracker',
		component: TrackerComponent
	},

	// Profile
	// {
	// 	path: 'profile',
	// 	component: ProfileComponent
	// },
	{
		path: 'dashboard',
		component: DashboardComponent
	},

	// otherwise redirect to home
	{
		path: '**',
		redirectTo: ''
	}
	
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})

export class AppRoutingModule { }