import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {  EnvironmentPortal, FanIDConfig } from '@fan-id/core';

@Component({
  selector: 'fan-id-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

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
    let el = document.getElementById(id);
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  scrollToExternalSite(url:string ){
    window.open(this.config.portalUrl+url, '_blank');
  }

}
