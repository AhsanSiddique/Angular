import { BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  public languages: string[] = ['en', 'ar'];
  public layout = new BehaviorSubject(false);
  public languageDetails = [
    {
      id: 1,
      name: 'en',
      description: 'English',
      flag: 'en.svg',
      layout: 'ltr',
    },
    {
      id: 2,
      name: 'ar',
      description: 'Arabic',
      flag: 'ar.svg',
      layout: 'rtl',
    },
  ];
  constructor(
    public translate: TranslateService,
    private cookieService: CookieService
  ) {
    this.translate.addLangs(this.languages);
    let browserLang;
    if (localStorage.getItem('lang')) {
      browserLang = localStorage.getItem('lang');
    } else {
      localStorage.setItem('lang', 'en');
      browserLang = 'en';
    }
    this.emitLayout();
    translate.use(browserLang.match(/en|ar/) ? browserLang : 'en');
  }

  public setLanguage(lang) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
    this.emitLayout();
  }

  public getSelectedLanguage() {
    return this.languageDetails.find(
      (obj) => obj.name == localStorage.getItem('lang')?.toString()
    );
  }

  get languageId() {
    return this.getSelectedLanguage()?.id
  }

  public emitLayout() {
    const selectedLanguage = this.languageDetails.find(
      (obj) => obj.name == localStorage.getItem('lang')?.toString()
    );
    if (selectedLanguage.layout == 'rtl') {
      this.layout.next(true);
    } else {
      this.layout.next(false);
    }
  }
}
