import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@fan-id/core';

@Component({
  selector: 'fan-id-termsandcondition',
  templateUrl: './termsandcondition.component.html',
  styleUrls: ['./termsandcondition.component.scss']
})
export class TermsandconditionComponent implements OnInit {

  isRTLLayout= false;
  constructor(private languageService: LanguageService) {  
    this.languageService.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
  }

  ngOnInit() {}
  
  
  

}
