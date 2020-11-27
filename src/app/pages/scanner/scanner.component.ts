import { Component, OnInit, ViewEncapsulation, Version } from '@angular/core';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { Subject, Observable, Subscription } from 'rxjs';
import { ScannerService, ScanType } from '@app/pages/scanner/scanner.service';
import { Router } from '@angular/router';
import { Card, CardVersion } from '@app/pages/cards/card';
import { Checkbox,  } from '@app/controls/checkbox';
import { Menu, MenuItem } from '@app/controls/menu';
import { NotificationsService, Notification } from '@app/controls/notifications';
import { AutoUnsubscribe } from "ngx-auto-unsubscribe";
import { CardsService } from '../cards';
import { Icons } from '@app/models/icons';
import { Title } from '@angular/platform-browser';
import { AlertType, Alert } from '@app/controls/alert/alert';
import { LoaderService } from '@app/controls';

@AutoUnsubscribe()
@Component({
	selector: 'mb-scanner',
	templateUrl: './scanner.component.html',
	encapsulation: ViewEncapsulation.None,
	styleUrls: ['./scanner.component.scss']
})

export class ScannerComponent implements OnInit {

	constructor(
		private titleService: Title,
		private scannerService: ScannerService,
		private cardsService: CardsService,
		private router: Router,
		private loaderService: LoaderService,
		private notificationService: NotificationsService) { }

	// Webcam options
	public lastImageSize: string;
	public showWebcam = true;
	public allowCameraSwitch = true;
	public deviceId: string;
	public multipleWebcamsAvailable = false;
	public videoOptions: MediaTrackConstraints = {};
	public errors: WebcamInitError[] = [];
	public webcamImage: WebcamImage = null;
	private trigger: Subject<void> = new Subject<void>();
	// switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
	private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

	// Service subscriptions
	scannerServiceSubscription: Subscription;
	scannerMultipleServiceSubscription: Subscription;

	// Options
	subscribedSingle: boolean = false; // use dto prevent no cards found when subscription initalizes
	subscribedMulti: boolean = false;
	searching: boolean = false;
	scanning: boolean = false;
	showOptions: boolean = false;
	timer: any;
	matches: Card[] = [];
	visibleMatches: Card[] = [];
	testError: string = "";
	prompt: boolean = false;
	lastMatchedCard: Card = null;
	totalNullResults: number = 0;
	soundEffect: HTMLAudioElement;
	scannerMode: ScanType = ScanType.snapshot; // Default mode
	scanned: boolean = false; // Prevent sound effect when adding matches from cache

	alert: Alert;

	checkboxBatchMode: Checkbox;
	menuScannerModes: Menu;
	menuItemModeSnapshot: MenuItem;
	menuItemModeScanner: MenuItem;
	menuItemModeMultiple: MenuItem;
	menuScannerOptions: Menu;
	showResult: boolean;
	scannerResultMenu: Menu;
	scannerResultMenuItem: MenuItem;
	get showActionScan(): boolean {
		return this.scannerMode == ScanType.scan;
	};
	get showActionSnapshot(): boolean {
		return this.scannerMode == ScanType.snapshot;
	};
	get showActionMultiple(): boolean {
		return this.scannerMode == ScanType.multiple;
	};

	setMode() {
		switch(this.scannerMode) {
			case ScanType.snapshot: {
				this.setModeSnapshot();
				break;
			}
			case ScanType.scan: {
				this.setModeScanner();
				break;
			}
			case ScanType.multiple: {
				this.setModeMultiple();
				break;
			}
		}
	}

	setModeSnapshot() {
		this.menuScannerModes.clearActive();
		this.scannerMode = ScanType.snapshot;
		this.menuItemModeSnapshot.active = true;
		this.setupService();
	}

	setModeScanner() {
		this.menuScannerModes.clearActive();
		this.scannerMode =  ScanType.scan;
		this.menuItemModeScanner.active = true;
		this.setupService();
	}

	setModeMultiple() {
		this.menuScannerModes.clearActive();
		this.scannerMode = ScanType.multiple;
		this.menuItemModeMultiple.active = true;
		this.setupService();
	}

	ngOnDestroy() { }
	ngOnInit() {
		WebcamUtil.getAvailableVideoInputs()
			.then((mediaDevices: MediaDeviceInfo[]) => {
				this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
				if (this.multipleWebcamsAvailable) {
					// Try to go to rear camera
					this.showNextWebcam(mediaDevices[1].deviceId);
				}
			});

		this.loadSoundEffect();

		this.titleService.setTitle('Mana Binder: Scanner');

		this.checkboxBatchMode = new Checkbox({
			checked: false,
			text: "Batch Mode"
		});

		// Alert
		this.alert = new Alert({
			message: `
				<ul class="unordered-list">
					<li>
						<b>Single mode:</b> this algorithm looks for a single card name.
					</li>
					<li>
						<b>Multiple mode:</b> this algorithm looks for multiple card names.
					</li>
					<li>
						For best results with either mode, make sure the card name is completely visible and in focus.
					</li>
					<li>
						Our algorithms primarily uses card name text detection, unfortunaly identifying specific sets is not supported.
					</li>
				</ul>
			`,
		});

		// Options
		let scannerOptionMenuItems: MenuItem[] = [];
		let switchCameraMenuItem = new MenuItem({
			text: "Switch Cameras",
			icon: Icons.sync,
			click: () => {
				this.showNextWebcam(true);
			}
		});

		// Only add switch camer option if multi cameras
		if (this.multipleWebcamsAvailable) {
			scannerOptionMenuItems.push(switchCameraMenuItem);
		}

		// Only show menu if have options available
		if (scannerOptionMenuItems.length) {
			this.menuScannerOptions = new Menu({
				classes: "round bg",
				horizontal: true,
				items: [
					new MenuItem({
						icon: Icons.settings,
						menu: new Menu({
							classes: "round bg",
							items: scannerOptionMenuItems
						})
					})
				]
			})
		}

		// Modes menu
		this.menuItemModeSnapshot = new MenuItem({
			icon: Icons.camera,
			classes: "box",
			text: "Single",
			click: () => {
				this.setModeSnapshot();
			}
		});
		this.menuItemModeScanner = new MenuItem({
			icon: Icons.play,
			classes: "box",
			text: "Scanner",
			click: () => {
				this.setModeScanner();
			}
		});
		this.menuItemModeMultiple = new MenuItem({
			icon: Icons.bringFront,
			classes: "box",
			text: "Multiple",
			click: () => {
				this.setModeMultiple();
			}
		});
		this.menuScannerModes = new Menu({
			clearActiveClickOutside: false,
			horizontal: true,
			classes: "bg square",
			items: [
				this.menuItemModeSnapshot,
				//this.menuItemModeScanner,
				this.menuItemModeMultiple
			]
		});
		
		if (this.scannerService.scannerList.cards.length) {
			this.addMatches(this.scannerService.scannerList.cards);
		}
		this.setMode();
	}
	
	setupService() {
		switch(this.scannerMode) {
			case ScanType.snapshot:
			case ScanType.scan: {
				this.setupScannerService();
				break;
			}
			case ScanType.multiple: {
				this.setupMultipleScannerService()
				break;
			}
		}
	}

	setupScannerService() {
		if (!this.scannerServiceSubscription) {
			this.scannerServiceSubscription = this.scannerService.getScanCardObservable().subscribe((card: Card) => {
				this.loaderService.hide();
				this.searching = false;
				if (card) {
					if (this.scanning) {
						this.totalNullResults = 0;
					}
					if (this.scannerMode == ScanType.snapshot || !this.lastMatchedCard || this.lastMatchedCard.id != card.id) {
						this.addMatches([card]);
					}
				}
				else {
					if (this.scanning) {
						// Stop scanner if 10 null results
						// Prevents spamming server if user is not doing anything
						this.totalNullResults ++;
						if (this.totalNullResults > 10) {
							this.scannerStop();	
						}
					}
					else if (this.subscribedSingle) {
						this.notificationService.addNotifications([
							new Notification({
								alertType: AlertType.warning,
								message: "No card(s) found",
							})
						])
					}
				}
				this.subscribedSingle = true;
			});
		}
	}

	setupMultipleScannerService() {
		if (!this.scannerMultipleServiceSubscription) {
			this.scannerMultipleServiceSubscription = this.scannerService.getScanCardsObservable().subscribe((cards: Card[]) => {
				this.loaderService.hide();
				this.searching = false;
				if (cards && cards.length > 0) {
					this.addMatches(cards);
				}
				else if (this.subscribedMulti) {
					this.notificationService.addNotifications([
						new Notification({
							alertType: AlertType.warning,
							message: "No card(s) found",
						})
					])
				}
				this.subscribedMulti = true;
			});
		}
	}

	buildVersionMenu(card) {
		if (card.alternate_printings.length) {
			// Build version menu
			let versionItems: MenuItem[] = [];
			card.alternate_printings.forEach((printing: CardVersion) => {

				let changeVersion = () => {
					this.cardsService.cardObservable().subscribe(newCard => {
						if (newCard) {
							this.scannerService.changeVersion(card, newCard);
							this.matches = this.scannerService.scannerList.cards;


							// Remove card from visible matches manually
							// For sake of animation
							this.visibleMatches = this.visibleMatches.filter(match => {
								return match.tempId != card.tempId;
							});
							this.visibleMatches.push(newCard);
							//this.lastMatchedCard = newCard;
							this.buildVersionMenu(newCard);

							this.scannerResultMenuItem.active = false;
						}
					});
					this.cardsService.card(printing.id);
				}

				versionItems.push(new MenuItem({
					text: printing.set_name,
					price: printing.price,
					symbol: printing.set_symbol,
					click: () => {
						changeVersion();
					}
				}));

			});

			this.scannerResultMenuItem = new MenuItem({
				symbol: card.set_symbol,
				text: card.name,
				price: card.price,
				menu: new Menu()
			});

			// Add dropdown
			if (card.alternate_printings.length > 1) {
				this.scannerResultMenuItem.menu = new Menu({
					classes: "anchor-right",
					maxHeight: "480px",
					maxWidth: "400px",
					items: versionItems
				});
				// this.scannerResultMenuItem.click = () => {
				// 	if (this.scanning) {
				// 		this.scannerStop();
				// 	}
				// }
			}
			this.scannerResultMenu = new Menu({
				horizontal: true,
				classes: "round bg",
				items: [
					this.scannerResultMenuItem
				]
			});
		}
	}

	addMatches(cards: Card[]) {
		if (this.scanned) {
			this.playSoundEffect();
		}
		cards.forEach((card) => {
			this.addMatch(card);
		});
	}

	addMatch(card: Card) {
		card.tempId = this.scannerService.getTempId();

		// Limit tray to 10
		if (this.visibleMatches.length >= 6) {
			this.visibleMatches.shift();
		}
		this.visibleMatches.push(card);
		this.matches.push(card);
		this.lastMatchedCard = card;
		this.buildVersionMenu(card);

		// Update service cache
		this.scannerService.scannerList.cards = this.matches;
	}

	loadSoundEffect() {
		this.soundEffect = new Audio();
		this.soundEffect.src = "../../assets/audio/soundeffect.mp3";
		this.soundEffect.load();
	}

	playSoundEffect() {
		this.soundEffect.play();
	}

	triggerSnapshot(): void {
		this.trigger.next();
	}

	toggleWebcam(): void {
		this.showWebcam = !this.showWebcam;
	}

	handleInitError(error: WebcamInitError): void {
		this.errors.push(error);
	}

	showNextWebcam(directionOrDeviceId: boolean | string): void {
		// true => move forward through devices
		// false => move backwards through devices
		// string => move to device with given deviceId
		this.nextWebcam.next(directionOrDeviceId);
	}

	handleImage(webcamImage: WebcamImage): void {
		this.scanned = true;
		console.info('received webcam image', webcamImage);
		this.webcamImage = webcamImage;
		let bytes = (webcamImage.imageAsBase64.length * (3/4)) - 2;
		let kilobytes = bytes / 1000;
		this.lastImageSize = `${kilobytes}kb`;

		// Send request to server
		switch (this.scannerMode) {
			case ScanType.scan: {
				this.scannerService.getScanCard({
					image: webcamImage.imageAsBase64
				});
				break;
			}
			case ScanType.snapshot: {
				this.scannerService.getScanCard({
					image: webcamImage.imageAsBase64
				});
				break;
			}
			case ScanType.multiple: {
				this.searching = true;
				this.scannerService.getScanCards({
					image: webcamImage.imageAsBase64
				});
				break;
			}
		}
	}

	cameraWasSwitched(deviceId: string): void {
		console.log('active device: ' + deviceId);
		this.deviceId = deviceId;
	}

	get triggerObservable(): Observable<void> {
		return this.trigger.asObservable();
	}

	get nextWebcamObservable(): Observable<boolean | string> {
		return this.nextWebcam.asObservable();
	}

	// Start
	scannerStart() {
		this.timer = setInterval(() => {
			this.runScan();
		}, 250);
		this.scanning = true;
	}

	// Stop
	scannerStop() {
		clearInterval(this.timer);
		this.scanning = false;
	}

	// Start/stop scanner
	scannerToggle() {
		if (this.scanning) {
			this.scannerStop();
		}
		else {
			this.scannerStart();
		}
		this.runScan();
	}

	// Trigger a scan
	runScan() {
		if (!this.searching) {
			if (this.scannerMode != ScanType.scan) {
				this.loaderService.show();
			}
			if (this.trigger) {
				this.trigger.next();
			}
			else {
				this.scannerStop();
				alert('NO TRIGGER');
			}
		}
	}
}
