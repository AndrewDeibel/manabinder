import { UserCard } from '@app/pages/cards/card/card';

export class Deck {
	id: number;
	user_id: number;
	deck_id: number;
	created_at: Date;
	updated_at: Date;
	name: string;
	public: boolean;
	tags: string;
	cards: UserCard[] = [];
	stats: DeckStats;
	route: string;
	image: string;
	partnerImage1: string;
	partnerImage2: string;
	format: Format;
	format_id: number;
	archetype: string;
	commander_ids: number[] = [];
	commanders: UserCard[] = [];
	companion: UserCard;
	companion_id: number;
	power_level: number;
	short_description: string;
	//metadata: UserCardMetaData[];

    public constructor(init?:Partial<Deck>) {
		Object.assign(this, init);

		this.commanders = [];

		this.route = `/decks/${this.id}`;

		if (this.format_id && !this.format) {
			this.format = new Format({
				id: this.format_id,
				name: this.getFormat()
			});
		}

		if (typeof this.commander_ids === "string") {
			this.commander_ids = JSON.parse(this.commander_ids);
		}

		if (this.commander_ids === null) {
			this.commander_ids = [];
		}
		
		if (this.cards.length) {

			// Default image is first card
			this.image = this.cards[0].card.images.art_crop;

			// If commander
			if (this.commander_ids.length) {

				// Get image from commander(s)
				let result1 = this.cards.filter(card => {
					return card.card.id === this.commander_ids[0];
				});
				let commander1: UserCard;
				if (result1.length) {
					commander1 = result1[0];
					this.commanders.push(result1[0]);
				}

				// Partner commaners
				if (this.commander_ids.length > 1) {
					let result2 = this.cards.filter(card => {
						return card.card.id === this.commander_ids[1];
					});
					if (result2.length) {
						let commander2 = result2[0];
						this.commanders.push(result2[0]);
						if (result1.length)
							this.partnerImage1 = commander1.card.images.art_crop;
						this.partnerImage2 = commander2.card.images.art_crop;
					}
				}
				else if (result1.length) {
					this.image = commander1.card.images.art_crop;
				}
			}
		}
	}
	
	getFormat() {
		switch (this.format_id) {
			case 8: return "Brawl";
			case 1: return "Commander";
			case 11: return "Duel";
			case 12: return "Future";
			case 9: return "Historic";
			case 2: return "Legacy";
			case 3: return "Modern";
			case 13: return "Oldschool";
			case 7: return "Pauper";
			case 10: return "Penny";
			case 6: return "Pioneer";
			case 4: return "Stander";
			case 5: return "Vintage";
		}
	}
}

export class Format {
	id: number;
	name: string;
	public constructor(init?:Partial<Format>) {
		Object.assign(this, init);
	}
}

export class DeckStats {
	colors: string[];
	mana_breakdown: ManaBreakdown;
	average_cmc: number;
	total_value: number;
}

export class ManaBreakdown {
	W: number;
	U: number;
	B: number;
	R: number;
	G: number;
}
