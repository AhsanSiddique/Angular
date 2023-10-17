import { Component,OnInit } from '@angular/core';

@Component({
  selector: 'fan-id-amir-cup-cookie-consent',
  templateUrl: './amir-cup-cookie-consent.component.html',
  styleUrls: ['./amir-cup-cookie-consent.component.scss']
})
export class AmirCupCookieConsentComponent implements OnInit {


  showConsent:boolean=false;

  ngOnInit(){
    const consent= localStorage.getItem('cookie-consent');
    if(consent){
      this.showConsent=false;
    }
      else{
      this.showConsent=true;
    }
  }

  submitCookie(accept:boolean){
    localStorage.setItem('cookie-consent',accept+"");
    this.showConsent=false;
  }
}

