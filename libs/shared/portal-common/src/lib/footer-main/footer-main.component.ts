import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EnvironmentPortal, FanIDConfig } from '@fan-id/core';

@Component({
  selector: 'fan-id-footer-main',
  templateUrl: './footer-main.component.html',
  styleUrls: ['./footer-main.component.scss']
})
export class FooterMainComponent implements OnInit {

  constructor(  @Inject(FanIDConfig) private config: EnvironmentPortal,private router:Router) { }
  redirectionLinks={
    privacy:'/web/hcep/privacy-policy',
    terms:'/web/hcep/terms-of-use',
    cookie:'/web/hcep/cookie-policy'
  }
  year:number;
  ngOnInit(): void {
    var currentTime = new Date()
    this.year = currentTime. getFullYear()
  }
  scrolltoContact(id: any) {
    // if(this.router.url.startsWith('/home')){
    let el = document.getElementById(id);
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  // }
  //   else{
  //     this.router.navigateByUrl("/home?fragment=footer");
  //   }
  }

  scrollToExternalSite(url:string ){
    window.open(this.config.portalUrl+url, '_blank');
  }

}
