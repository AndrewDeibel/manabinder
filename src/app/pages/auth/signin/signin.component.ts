import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Textbox } from '@app/controls/textbox/textbox';
import { Button, ButtonType } from '@app/controls/button';
import { Checkbox } from '@app/controls/checkbox';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { NotificationsService, Notification, AlertType } from '@app/controls';

@Component({
	selector: 'mb-signin',
	templateUrl: './signin.component.html',
	styleUrls: ['./signin.component.scss']
})

export class SignInComponent implements OnInit {

	loading: boolean = false;
	returnUrl: string;
	form: FormGroup;
	textboxEmail: Textbox;
	textboxPassword: Textbox;
	rememberMeCheckbox: Checkbox;
	buttonSubmit: Button;

	constructor(
		private notificationService: NotificationsService,
		private formBuilder: FormBuilder,
		private router: Router,
		private route: ActivatedRoute,
		private authenticationService: AuthenticationService) {
		if (this.authenticationService.currentUserValue) {
			this.router.navigateByUrl("/");
		}
	}

	ngOnInit(): void {
		this.form = this.formBuilder.group({
			emailControl: ['', Validators.required],
			passwordControl: ['', Validators.required],
			rememberMeControl: [''],
		});
		this.textboxEmail = new Textbox({
			label: "Email"
		});
		this.textboxPassword = new Textbox({
			label: "Password",
			type: "password"
		});
		this.rememberMeCheckbox = new Checkbox({
			text: "Remember Me",
			id: "rememberMe"
		});
		this.buttonSubmit = new Button({
			text: "Sign In",
			type: ButtonType.submit
		});

		// Get return url from route params, else default to /
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}

	submit() {
		if (this.form.invalid) {
			return;
		}

		this.loading = true;
		this.authenticationService.login(this.form.controls.emailControl.value, this.form.controls.passwordControl.value)
			.pipe(first())
			.subscribe(
				data => {
					//location.href = this.returnUrl;
					this.router.navigateByUrl(this.returnUrl);
					this.notificationService.addNotifications([
						new Notification({
							alertType: AlertType.success,
							message: "Successfully signed in"
						})
					])
				},
				error => {
					this.loading = false;
				}
			)
	}

}
