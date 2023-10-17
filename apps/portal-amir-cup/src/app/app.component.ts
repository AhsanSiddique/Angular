import {
  Router,
  Event,
  NavigationError,
  NavigationStart,
  NavigationEnd
} from '@angular/router';
import { LanguageService } from '@fan-id/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { DOCUMENT } from '@angular/common';
import { Component, Inject} from '@angular/core';
import { filter } from 'rxjs/operators';
@Component({
  selector: 'fan-id-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Amir-cup';
  isRTLLayout: boolean;
  constructor(
    public language: LanguageService,
    private router: Router,
    private spinner: NgxSpinnerService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.language.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
      if(this.isRTLLayout)
        this.document.body.classList.add('rtl');
        else{
          this.document.body.classList.remove('rtl');
        }

    });

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
    });

    this.router.events.pipe(filter((rs): rs is NavigationEnd => rs instanceof NavigationEnd)).subscribe(events=>{
      // if(events.id===1 && events.url===events.urlAfterRedirects && !events.url.includes('reset-password'))
      // {
      //   this.router.navigate(['/home']);
      // }
      // if(events.url.includes('main')){
      //   const token = localStorage.getItem('accessToken');
      //   if (!token) {
      //     this.router.navigate(['/home']);
      //     return false;
      //   }
      // }
    });
  }
}
