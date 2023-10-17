import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '@fan-id/core';

@Component({
  selector: 'fan-id-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
})
export class LanguageComponent implements OnInit {
  langData: any[];
  selectedLang: any;
  constructor(private languageService: LanguageService,
    private router: Router) {}

  ngOnInit(): void {
    this.langData = this.languageService.languageDetails;
    this.selectedLang = this.languageService.getSelectedLanguage();
  }
  changeLanguage(obj) {
    this.languageService.setLanguage(obj);
    this.selectedLang = this.languageService.getSelectedLanguage();
  }
  routerCheck(){
    let result = false
    if(this.router.url === '/auth/login'){
      result = true
    }
    return result;
  }
}
