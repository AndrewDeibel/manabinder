export class Alert {
	message: string;
	type: AlertType;

    public constructor(init?:Partial<Alert>) {
        Object.assign(this, init);
	}
}
export enum AlertType {
	success = "success",
	info = "info",
	warning = "warning",
	error = "error"
}