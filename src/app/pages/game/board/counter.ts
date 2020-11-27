export class Counter {
	name: string;
	value: number;
	color: string;
	id: number;
	x: number;
	y: number;

    constructor(init?:Partial<Counter>) {
		Object.assign(this, init);
	}

	increment() {
		this.value++;
	}
}