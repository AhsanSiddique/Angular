import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreService } from '@fan-id/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fan-id-amir-cup-layout',
  templateUrl: './amir-cup-layout.component.html',
  styleUrls: ['./amir-cup-layout.component.scss'],
})
export class AmirCupLayoutComponent  {
  isHomePage: boolean = false;
  token: string | null = '';
  constructor(
    private router: Router,
    private coreService: CoreService,
    private cookieService: CookieService
  ) {
    router.events.subscribe((events) => {
      if (this.router.url.startsWith('/home')) {
        this.isHomePage = true;
      } else if (this.router.url.split('?')[0] === '/reset-password') {
        this.isHomePage = true;
      } else {
        this.isHomePage = false;
      }
    });

    this.checkLogin();
  }

  checkLogin() {
    const rememberMe = localStorage.getItem('rememberMe');
    const token = JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken')));;
    const isLoggedIn = this.cookieService.get('loggedIn')

    if(token) {
      if(!rememberMe && !isLoggedIn) {
        // logout user if token present and rememberMe disabled and in a new session
        console.log('rememberMe logout')
        this.coreService.logout();
        this.router.navigateByUrl('/home');
      }
    }
  }

}
