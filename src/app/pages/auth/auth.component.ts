import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Textbox } from '@app/controls/textbox/textbox';
import { Button, ButtonType } from '@app/controls/button';
import { Menu, MenuItem } from '@app/controls/menu';
import { AuthenticationService } from '@app/pages/auth/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { Icons } from '@app/models/icons';
import { LoaderService } from '@app/controls';

@Component({
	selector: 'mb-auth',
	templateUrl: './auth.component.html',
	styleUrls: ['./auth.component.scss'],
	encapsulation: ViewEncapsulation.None
})

export class AuthComponent implements OnInit {

	returnUrl: string;
	form: FormGroup;
	textboxUsername: Textbox;
	textboxPassword: Textbox;
	buttonSubmit: Button;
	authMenu: Menu;
	showSignIn: boolean = true;
	showSignUp: boolean = false;

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
		let url = this.router.url;

		if (url.includes('signin')) {
			this.showSignIn = true;
			this.showSignUp = false;
		}
		else if (url.includes('signup')) {
			this.showSignIn = false;
			this.showSignUp = true;
		}

		this.authMenu = new Menu({
			classes: "large",
			horizontal: true,
			tabs: true,
			items: [
				new MenuItem({
					icon: Icons.signIn,
					text: "Sign In",
					active: url.includes('signin'),
					route: "/signin"
				}),
				new MenuItem({
					icon: Icons.userPlus,
					text: "Sign Up",
					active: url.includes('signup'),
					route: "/signup"
				})
			]
		})

		this.form = this.formBuilder.group({
			usernameControl: ['', Validators.required],
			passwordControl: ['', Validators.required]
		});
		this.textboxUsername = new Textbox({
			label: "Username"
		});
		this.textboxPassword = new Textbox({
			label: "Password",
			type: "password"
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

		this.loaderService.show();
		this.authenticationService.login(this.form.controls.usernameControl.value, this.form.controls.passwordControl.value)
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