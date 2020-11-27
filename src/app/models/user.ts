import { Card, OwnedCard } from '@app/pages/cards/card/card';

export class User {
	id: number;
	username: string;
	email: string;
	email_verified_at?: Date;
	created_at: Date;
	updated_at: Date;
	full_name?: string;
	email_verify_token: string;
	image?: string;
	bio?: string;
	reputation: number;
	patreon_id?: number;
	patreon_status?: string;
	patreon_tier?: string;

	// Cards
	ownedCardIds: OwnedCard[] = [];

	// Authentication
	token?: string;
	expires_at?: Date;

    public constructor(init?:Partial<User>) {
        Object.assign(this, init);
    }
}