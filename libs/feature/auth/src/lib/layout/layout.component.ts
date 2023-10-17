import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, NavigationStart, Router } from '@angular/router';
import { CoreService, LanguageService } from '@fan-id/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fan-id-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent implements OnInit {
  isRTLLayout: boolean;
  pageData: any;
  centerScreenAlignment =[
    '/auth/signup'
  ]
  isCenterAlign = false;
  constructor(
    private languageService: LanguageService,
    private activatedroute: ActivatedRoute,
    private router: Router,
    private coreService: CoreService,
    private cookieService: CookieService
  ) {}

  ngOnInit(): void {
    this.languageService.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
      console.log('test', this.isRTLLayout);
    });
    this.pageData = this.activatedroute.snapshot.firstChild.data;
    console.log(this.pageData)
    this.router.events.subscribe((event) => {
      this.pageData = this.activatedroute.snapshot.firstChild.data;
    });
    this.checkLogin();

  }
  checkLogin() {
    const rememberMe = localStorage.getItem('rememberMe');
    const token = JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken')));
    const isLoggedIn = this.cookieService.get('loggedIn');
    console.log(isLoggedIn, rememberMe);
    if(token) {
       if(this.router.url.startsWith('/auth/reset-password')){
        localStorage.removeItem('accessToken')
      }
      else if(!rememberMe && !isLoggedIn) {
        // logout user if token present and rememberMe disabled and in a new session
        console.log('rememberMe logout')
        this.coreService.logout();
        this.router.navigateByUrl('/');
      }
      else if(this.router.url === '/auth/login'){

        this.router.navigate(['/main/dashboard'], {});
      }
    }
    else if(this.router.url.startsWith('/auth/reset-password')|| this.router.url.startsWith('/auth/signup')|| this.router.url.startsWith('/auth/orgsignup')){
      // Empty on purpose
    }
    else{
      this.coreService.logout();
        this.router.navigateByUrl('/');
    }
  }
}
