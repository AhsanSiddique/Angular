import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@fan-id/core';

@Component({
  selector: 'fan-id-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent implements OnInit {

 

  isRTLLayout = true
  constructor(private languageService: LanguageService) {
    this.languageService.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
   }


  ngOnInit(): void {
  }

}
