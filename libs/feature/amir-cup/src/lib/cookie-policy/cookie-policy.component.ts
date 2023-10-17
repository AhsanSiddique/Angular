import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@fan-id/core';

@Component({
  selector: 'fan-id-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss']
})
export class CookiePolicyComponent implements OnInit {


  isRTLLayout = true
  constructor(private languageService: LanguageService) {
    this.languageService.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
   }

  ngOnInit(): void {
  }

}
