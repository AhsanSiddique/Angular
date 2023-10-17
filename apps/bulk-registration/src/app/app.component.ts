import { Component, Inject } from '@angular/core';
import {
  Router,
  Event,
  NavigationError,
  NavigationStart,
  NavigationEnd
} from '@angular/router';
import { CoreService, Environment, FanIDConfig, LanguageService } from '@fan-id/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { AngularPlugin } from '@microsoft/applicationinsights-angularplugin-js';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
@Component({
  selector: 'fan-id-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'bulk-registration';
  isRTLLayout: boolean;

  // Idle Manager

  idleState = 'Not started.';
  timedOut = false;
  lastPing?: Date = null;
  userIdle: boolean;
  //End

  constructor(
    public language: LanguageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    private coreService: CoreService,
    @Inject(FanIDConfig) private config: Environment,
    private idle: Idle,
    private keepalive: Keepalive
  ) {
    localStorage.removeItem("idToken");

    const angularPlugin = new AngularPlugin();
    const appInsights = new ApplicationInsights({ config: {
    instrumentationKey: this.config.instrumentationKey,
    enableAutoRouteTracking: true, // option to log all route changes
    autoTrackPageVisitTime: true,
    extensions: [angularPlugin],
    extensionConfig: {
        [angularPlugin.identifier]: { router: this.router }
    }
    } });
    if(this.config.instrumentationKey!='')
    appInsights.loadAppInsights();

     // Idle TIme Start
     idle.setIdle(this.config.idleTime);

     idle.setTimeout(this.config.logoutTime);

    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => (this.idleState = 'No longer idle.'
    ));

    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.logout();
    });

    idle.onIdleStart.subscribe(() => {this.idleState = "You've gone idle!"
    this.userIdle=true;});
    idle.onTimeoutWarning.subscribe(
      (countdown) =>
        (this.idleState = 'You will time out in ' + countdown + ' seconds!')
    );

    // Sets the ping interval to 15 seconds
    keepalive.interval(15);

    keepalive.onPing.subscribe(() => (this.lastPing = new Date()));

    // Lets check the path everytime the route changes, stop or start the idle check as appropriate.

    //End
    this.language.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
    this.setAppSettings();

    this.router.events.subscribe((event: Event) => {
      switch (true) {
        case event instanceof NavigationStart: {
          this.spinner.show();
          break;
        }
        // case event instanceof NavigationCancel: // not compatible with route resolve
        case event instanceof NavigationEnd:
        case event instanceof NavigationError: {
          setTimeout(() => {
            this.spinner.hide();
          }, 300);
        }
      }

      if (this.router.url.indexOf('/auth/') > -1) {
        idle.stop();


      } else {
        idle.watch();

      }
    });

  }


  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
    this.userIdle=false;
}

  setAppSettings() {
    if (!localStorage.getItem('language_culture_info')) {
      const key1 = new Date()
      const lang_token = (key1.getTime() * 10000) + 621355968000000000;
      localStorage.setItem('language_culture_info', lang_token.toString())
    }
    if (this.coreService.getCurrentLanguageId() == null || this.coreService.getCurrentLanguageId() == '') {
      this.coreService.setUserLangague('en')
      this.coreService.setCurrentLanguageId('1')
    }
  }

  logout(){
    this.coreService.logout();
    this.userIdle=false;
    this.router.navigate(['/auth/login'], {});

  }
}
