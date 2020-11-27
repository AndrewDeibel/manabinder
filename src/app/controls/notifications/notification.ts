import { Icons } from '@app/models/icons';
import { AlertType } from '../alert/alert';

export class Notification {
	id: number;
	message: string;
	alertType: AlertType;
	icon: Icons;
	hidden: boolean;
	duration?: number; // Null duration = dismiss required
	destroy: () => void;
	click = () => {

	}

    public constructor(init?:Partial<Notification>) {
		Object.assign(this, init);
		this.setupDefaults();
	}

	setupDefaults() {
		let defaultDuration = 3000;
		switch (this.alertType) {
			case AlertType.success: {
				if (!this.duration) {
					this.duration = defaultDuration
				}
				this.icon = Icons.check;
				this.click = () => {
					this.hide();
				}
				break;
			}
			case AlertType.info: {
				this.icon = Icons.info;
				break;
			}
			case AlertType.warning: {
				if (!this.duration) {
					this.duration = defaultDuration
				}
				this.icon = Icons.warning;
				this.click = () => {
					this.hide();
				}
				this.icon = Icons.warning;
				break;
			}
			case AlertType.error: {
				this.icon = Icons.error;
				break;
			}
		}
		if (this.duration) {
			this.startTimer();
		}
	}

	startTimer() {
		setTimeout(() => {
			this.hide();
		}, this.duration);
	}

	hide() {
		this.hidden = true;
		setTimeout(() => {
			if (this.destroy) {
				this.destroy();
			}
		}, 1000);
	}
}