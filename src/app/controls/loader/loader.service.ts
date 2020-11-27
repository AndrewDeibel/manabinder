import { Injectable } from "@angular/core";
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})

export class LoaderService {

	public loading = new BehaviorSubject(false);
	constructor() {}

	show() {
		if (this.loading.value != true)
			this.loading.next(true);
	}
	hide() {
		if (this.loading.value != false)
			this.loading.next(false);
	}

}