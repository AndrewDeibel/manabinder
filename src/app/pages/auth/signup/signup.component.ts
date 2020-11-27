import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Textbox } from '@app/controls/textbox/textbox';
import { Button, ButtonType } from '@app/controls/button';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { LoaderService } from '@app/controls';

@Component({
	selector: 'mb-signup',
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})

export class SignUpComponent implements OnInit {

	returnUrl: string;
	form: FormGroup;
	textboxEmail: Textbox;
	textboxUsername: Textbox;
	textboxPassword: Textbox;
	textboxConfirmPassword: Textbox;
	buttonSubmit: Button;

	constructor(
		private loaderService: LoaderService,
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
			usernameControl: ['', Validators.required],
			passwordControl: ['', Validators.required],
			passwordConfirmControl: ['', Validators.required]
		});
		this.textboxEmail = new Textbox({
			label: "Email",
			type: "email"
		});
		this.textboxUsername = new Textbox({
			label: "Username"
		});
		this.textboxPassword = new Textbox({
			label: "Password",
			type: "password"
		});
		this.textboxConfirmPassword = new Textbox({
			label: "Confirm Password",
			type: "password"
		});
		this.buttonSubmit = new Button({
			text: "Sign Up",
			type: ButtonType.submit
		});

		// Get return url from route params, else default to /
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
	}

	submit() {
		if (this.form.invalid) {
			return;
		}

		this.loaderService.show();
		this.authenticationService.register(
			this.form.controls.emailControl.value,
			this.form.controls.usernameControl.value,
			this.form.controls.passwordControl.value,
			this.form.controls.passwordConfirmControl.value)
			.pipe(first())
			.subscribe(
				data => {
					this.router.navigateByUrl(this.returnUrl);
				},
				error => {
					this.loaderService.hide();
				}
			)
	}

}
