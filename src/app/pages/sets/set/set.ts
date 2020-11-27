import { Card } from '@app/pages/cards';

export class Set {
	id: number;
    name: string;
	code: string;
	type?: string;
	symbol?: string;
	total_cards?: number;
	online_only?: boolean;
	release_date?: Date;
	route: string;

	cards: Card[];
	
	block_id?: number;
	block_name?: string;

    constructor(init?:Partial<Set>) {
		Object.assign(this, init);
		
		this.route = `/sets/${this.code}`;
    }
}