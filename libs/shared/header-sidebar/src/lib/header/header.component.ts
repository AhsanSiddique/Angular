import { formatDate } from '@angular/common';
import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import {

  CoreService,
  Environment,
  FanIDConfig,
  LanguageService,
  MenuService,
} from '@fan-id/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { AuthService } from 'libs/api/server/src/lib/services/auth.service';

@Component({
  selector: 'fan-id-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  time = formatDate(new Date(), 'mediumTime', 'en');
  date = formatDate(new Date(), 'EEE, dd MMM yyyy', 'en');
  username = localStorage.getItem('userName');
  firstName =localStorage.getItem('firstName');

  profileImg: string;
  selectedTerminal = '';
  isServiceCenter = false;
  selectedEvent='';
  constructor(
    private router: Router,
    private authService: AuthService,
    private menuService: MenuService,
    private coreService: CoreService,
    @Inject(FanIDConfig) private config: Environment
  ) {}

  ngOnInit(): void {
    this.profileImg = localStorage.getItem('profileImageUrl') || 'assets/images/profile@2x.png';
    this.menuService.eventSubject
    .pipe(distinctUntilChanged())
    .subscribe(event => {
      console.log({ event });
      this.selectedEvent = event;
    })

    setInterval(() => {
      this.time = formatDate(new Date(), 'mediumTime', 'en');
    }, 1);

    if (this.config.application === 'ServiceCenter') {
      this.selectedTerminal = this.menuService.getTerminalName();
      this.isServiceCenter = true;
    }
  }

  public logout() {
    this.menuService.removeEvent();
    this.coreService.logout();
    // this.authService.logOutSCBR().subscribe(response=>{
    //   console.log(">>>> ", localStorage.getItem('accessToken'))
    //   localStorage.removeItem('accessToken')

    //   this.router.navigate(['/']);
    // },
    // err=>{
    //   console.log(err)
    // })

  }
}
