import { Menu } from '@app/controls/menu';
import "@app/extensions/string.extensions";
import { Icons } from '@app/models';

export const DEFAULT_IMAGE = "/assets/back.jpg";

export class CardImages {
    small: string = DEFAULT_IMAGE;
    normal: string = DEFAULT_IMAGE;
    large: string = DEFAULT_IMAGE;
    png: string = DEFAULT_IMAGE;
    art_crop: string = DEFAULT_IMAGE;
	border_crop: string = DEFAULT_IMAGE;
	
    constructor(init?:Partial<CardImages>) {
        Object.assign(this, init);
    }
}

export class CardVersion {
    id: number;
    original_name?: string;
    name: string;
    text?: string;
    flavor_text?: string;
    original_text?: string;
	images: CardImages;
	images_json: string;
    rarity: string;
    set_id: number;
    set_name: string;
	set_code: string;
	set_symbol: string;
	language_id: number;
	route: string;
	price: number;
	
	constructor(init?:Partial<CardVersion>) {
		Object.assign(this, init);
        this.route = "/cards/" + this.id;
		
		// Parse JSON images
        if (this.images_json) {
            this.images = JSON.parse(this.images_json)
		}
	}
}

export class Card {
	id: number;
	tempId: number;
    name: string;
    original_name?: string; // Non english name, null if english
    edhrec_rank?: number;
    layout: CardLayout;
	cmc: number;
	token: boolean;
    mana_cost?: string;
    colors: string[]; // JSON
    color_identity: string[]; // JSON
    type: string;
    original_type?: string;
    rarity: string;
    set_name?: string;
    set_symbol?: string;
    set_code?: string;
    set_id?: number;
    number?: string;
    text?: string;
    original_text?: string;
    flavor_text?: string;
    flavor_name?: string;
    border_color: CardBorder;
    artist_id: number;
	artist_name: string;
	artist_route: string;
    power?: string;
    toughness?: string;
    loyalty?: string;
    images?: CardImages;
    images_json: string;
    no_images: boolean;
    language_name: string;
    language_english: string;
    watermark?: string;
    games: string[];
    frame?: string;
    full_art: boolean;
    textless: boolean;
    foil: boolean; // Has foil available
    nonfoil: boolean; // No foil available
    promo: boolean;
    reprint: boolean;
    variation: boolean;
    reserved: boolean;
    price?: number;
    price_foil?: number;
    price_eur?: number;
    price_tix?: number;
    released_at: Date;
    alternate_printings: CardVersion[] = [];
    alternate_languages: CardAlternateLanguage[];
    legalities: CardLegality[];
    rulings: CardRuling[];

    // Component specific
	itemsMenu: Menu = new Menu();
	versionsMenu: Menu = new Menu();
	route: string;
	userCard: UserCard;
	count: number = 1;

    constructor(init?:Partial<Card>) {
		Object.assign(this, init);

		// Route
		this.route = "/cards/" + this.id;
		
		// Mana cost
        if (this.mana_cost) {
            this.mana_cost = this.mana_cost.parseMana();
		}
		
		// Text
        if (this.text) {
            this.text = this.text.parseMana();
            this.text = this.text.parseNewLine();
		}

		// Rulings
		if (this.rulings && this.rulings.length) {
			this.rulings.forEach(ruling => {
				ruling.text = ruling.text.parseMana();
				ruling.text = ruling.text.parseNewLine();
			});
		}
		
		// Original text
        if (this.original_text) {
            this.original_text = this.original_text.parseMana();
		}
		
		// Images
        if (this.images == null) {
            this.images = new CardImages({
                small: "/assets/back.jpg",
                normal: "/assets/back.jpg",
                large: "/assets/back.jpg",
                art_crop: "/assets/back.jpg",
            });
            this.no_images = true;
        }
        if (this.images_json) {
			this.images = JSON.parse(this.images_json);
		}

		// Version
		if (this.alternate_printings) {
			for(let i = 0; i < this.alternate_printings.length; i++) {
				this.alternate_printings[i] = new CardVersion(this.alternate_printings[i]);
			}
		}

		// Artist
		if (this.artist_id) {
			this.artist_route = "/artists/" + this.artist_id;
		}
	}
}

export class OwnedCard {
	id: number;
	name: string;

    public constructor(init?:Partial<OwnedCard>) {
        Object.assign(this, init);
    }
}

export class DeckCard {
	id: number;
	user_id: number;
	card_id: number;
	created_at: Date;
	updated_at: Date;
	card: Card;
	userCard: UserCard;
}

export class UserCard {
	id: number;
	user_id: number;
	card_id: number;
	created_at: Date;
	updated_at: Date;
	card: Card;
	foil: boolean;
	quantity: number;
	deck_card_id: number;
	metadata: UserCardMetaData[];

    public constructor(init?:Partial<UserCard>) {
		Object.assign(this, init);

		// Build card
		if (this.card) {
			this.card = new Card(this.card);
			this.card.userCard = this;
		}
    }
}
export class UserCardMetaData {
	id: number;
	user_cards_id: number;
	key: string;
	value: string;
	created_at: Date;
	updated_at: Date;

    public constructor(init?:Partial<UserCardMetaData>) {
        Object.assign(this, init);
    }
}

export class CardAlternateLanguage {
    id: number;
    original_name?: string;
    name: string; // English name
    original_text?: string;
    text?: string;
    flavor_text?: string;
    flavor_name?: string;
    image_small?: string;
    image_normal?: string;
    image_large?: string;
    language_name: string;
    language_english: string;
}

export class CardLegality {
    name: CardFormats;
    legality: CardLegalityTypes;
}

export enum CardFormats {
	standard = "standard",
	brawl = "brawl",
	pioneer = "pioneer",
	historic = "historic",
	modern = "modern",
	pauper = "pauper",
	legacy = "legacy",
	penny = "penny",
	vintage = "vintage",
	commander = "commander"
}

export enum CardLegalityTypes {
	legal = "legal",
	not_legal = "not_legal",
	restricted = "restricted",
	banned = "banned"
}

export class CardRuling {
    date: Date;
    text: string;
}

export enum CardLayout {
    Normal = 'normal',
    Split = 'split',
    Flip = 'flip',
    Transform = 'transform',
    Meld = 'meld',
    Leveler = 'leveler',
    Saga = 'saga',
    Adventure = 'adventure',
    Planar = 'planar',
    Scheme = 'scheme',
    DoubleSided = 'double_sided',
    Token = 'token',
    DoubleFacedToken = 'double_faced_token',
    Emblem = 'emblem',
    Augment = 'augment',
    Host = 'host',
    ArtSeries = 'art_series',
    Plane = 'Plane',
    Phenomenon = 'phenomenon',
    Vangaurd = 'vangaurd',
    Aftermath = 'aftermath'
}

export enum CardBorder {
    Black = 'black',
    Borderless = 'borderless',
    Gold = 'gold',
    Silver = 'silver',
    White = 'white'
}

export class ManaCost {
    public white?: number;
    public whitePhyrexian?: number;
    public blue?: number;
    public bluePhyrexian?: number;
    public black?: number;
    public blackPhyrexian?: number;
    public red?: number;
    public redPhyrexian?: number;
    public green?: number;
    public greenPhyrexian?: number;
    public wastes?: number;
    public snow?: number;
    public any?: number;
    public x?: boolean;
    public hybridMana?: HybridMana[];

    public constructor(init?:Partial<ManaCost>) {
        Object.assign(this, init);
    }
}

export class HybridMana {
    public any: number;
    public white: boolean;
    public blue: boolean;
    public black: boolean;
    public red: boolean;
    public green: boolean;
}

export enum CardType {
	land = "Land",
	creature = "Creature",
	artifact = "Artifact",
	enchantment = "Enchantment",
	planeswalker = "Planeswalker",
	instant = "Instant",
	sorcery = "Sorcery"
}

export class CardGroup {
	title: string;
	icon: Icons;
	userCards: UserCard[] = [];
	cards: Card[] = [];
	count: number = 0;
    constructor(init?:Partial<CardGroup>) {
        Object.assign(this, init);
	}
}

export class CardCount {
	get count(): number {
		return this.cards.length;
	}
	cards: Card[] = [];
    constructor(init?:Partial<CardCount>) {
        Object.assign(this, init);
	}
}

export class UserCardCount {
	get count(): number {
		return this.cards.length;
	}
	cards: UserCard[] = [];
    constructor(init?:Partial<UserCardCount>) {
        Object.assign(this, init);
	}
}