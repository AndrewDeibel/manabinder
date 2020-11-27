export class ProgressBar {
	value: number;

    public constructor(init?:Partial<ProgressBar>) {
		Object.assign(this, init);
	}
}