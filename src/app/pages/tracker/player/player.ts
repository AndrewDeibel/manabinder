export class TrackerPlayer {
	lifeTotal: number;
	name: string;
	manaWhite: number = 0;
	manaBlue: number = 0;
	manaBlack: number = 0;
	manaRed: number = 0;
	manaGreen: number = 0;
	manaColorless: number = 0;

	infect: number = 0;
	commanderDamagePlayer1: number = 0;
	commanderDamagePlayer2: number = 0;
	commanderDamagePlayer3: number = 0;

    constructor(init?:Partial<TrackerPlayer>) {
		Object.assign(this, init);
	}

	reset() {
		this.lifeTotal = 40;
		this.manaWhite = 0;
		this.manaBlue = 0;
		this.manaBlack = 0;
		this.manaRed = 0;
		this.manaGreen = 0;
		this.manaColorless = 0;
	}

	increaseLife() {
		this.lifeTotal++;
	}
	decreaseLife() {
		this.lifeTotal--;
	}

	increaseManaWhite() {
		this.manaWhite++;
	}
	decreaseManaWhite() {
		if (this.manaWhite > 0) this.manaWhite--;
	}
	increaseManaBlue() {
		this.manaBlue++;
	}
	decreaseManaBlue() {
		if (this.manaBlue > 0) this.manaBlue--;
	}
	increaseManaBlack() {
		this.manaBlack++;
	}
	decreaseManaBlack() {
		if (this.manaBlack > 0) this.manaBlack--;
	}
	increaseManaRed() {
		this.manaRed++;
	}
	decreaseManaRed() {
		if (this.manaRed > 0) this.manaRed--;
	}
	increaseManaGreen() {
		this.manaGreen++;
	}
	decreaseManaGreen() {
		if (this.manaGreen > 0) this.manaGreen--;
	}
	increaseManaColorless() {
		this.manaColorless++;
	}
	decreaseManaColorless() {
		if (this.manaColorless > 0) this.manaColorless--;
	}

	increasePlayer1CommanderDamage() {
		this.commanderDamagePlayer1++;
	}
	decreasePlayer1CommanderDamage() {
		if (this.commanderDamagePlayer1 > 0) this.commanderDamagePlayer1--;
	}

	increasePlayer2CommanderDamage() {
		this.commanderDamagePlayer2++;
	}
	decreasePlayer2CommanderDamage() {
		if (this.commanderDamagePlayer2 > 0) this.commanderDamagePlayer2--;
	}

	increasePlayer3CommanderDamage() {
		this.commanderDamagePlayer3++;
	}
	decreasePlayer3CommanderDamage() {
		if (this.commanderDamagePlayer3 > 0) this.commanderDamagePlayer3--;
	}


}