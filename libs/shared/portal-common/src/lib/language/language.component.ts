import { Component, OnInit } from '@angular/core';
import { LanguageService } from '@fan-id/core';
@Component({
  selector: 'fan-id-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss']
})
export class LanguageComponent implements OnInit {
  langData: any[];
  selectedLang: any;
  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.langData = this.languageService.languageDetails;
    this.selectedLang = this.languageService.getSelectedLanguage();
  }
  changeLanguage(obj) {
    this.languageService.setLanguage(obj);
    this.selectedLang = this.languageService.getSelectedLanguage();
  }
}
