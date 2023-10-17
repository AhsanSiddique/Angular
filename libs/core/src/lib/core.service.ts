import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'libs/api/server/src/lib/services/auth.service';
import { Router } from '@angular/router';
import { Environment, FanIDConfig } from '..';
import * as crypto from 'crypto-js'

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  public layoutDirLTR: any = true;
  public selectedTerminal: any;
  public selectedPrinter:any;
  public loginObject: any;
  public isLoggedIn = new BehaviorSubject(false);
  private accessToken: any;

  logout() {
    //do service call for logout
    if(this.config.application === 'ServiceCenter' || this.config.application === 'BulkRegistration'){
    this.removeStorageItems();
    this.accessToken = null;
    if(JSON.parse(this.decryptValue(localStorage.getItem('accessToken')))){
      this.authService.logOutSCBR().subscribe(()=>{
        this.logoutProperties();
      },err=>{
        console.log(err)
        this.logoutErrorProperties();
      })
    }
    else{
      this.logoutErrorProperties()
        this.router.navigate(['/']);
      }
    }
    else if(this.config.application === 'AmirCupPortal'){
      if(JSON.parse(this.decryptValue(localStorage.getItem('accessToken')))){
        this.authService.customerPortalLogout().subscribe(()=>{
          this.logoutProperties();
        },err=>{
          console.log(err)
         this.logoutErrorProperties();
        })
      }
      else{
        this.logoutErrorProperties();
      }
    }
  }

  doLogin(obj){
    this.isLoggedIn.next(true);
  }
  removeStorageItems(){
    localStorage.removeItem('DataTables_importdatatable_/main/all-applications/list');
    localStorage.removeItem('DataTables_importdatatable_/main/card-pickup/list');
    localStorage.removeItem('DataTables_importdatatableqaa_/main/accomadation');
    localStorage.removeItem('DataTables_importdatatablesita_/main/accomadation');
    localStorage.removeItem('DataTables_organizationdatatable_/main/organization/all');
    localStorage.removeItem(
      'DataTables_verifyApplicationdatatable_/main/verify-application'
    );
    sessionStorage.removeItem('allAppsColumnName');
    sessionStorage.removeItem('allAppsFilterTxt');
    sessionStorage.removeItem('orgColumnName');
    sessionStorage.removeItem('orgFilterTxt');
    sessionStorage.removeItem('CardPickupColumnName');
    sessionStorage.removeItem('CardPickupFilterTxt');
    sessionStorage.removeItem('qaaFilterFormColumnName');
    sessionStorage.removeItem('qaaFilterFormFilterTxt');
    sessionStorage.removeItem('sitaFilterFormColumnName');
    sessionStorage.removeItem('sitaFilterFormFilterTxt');
    sessionStorage.removeItem('columnName');
    sessionStorage.removeItem('filterTxt');
    sessionStorage.removeItem('advFilters');
    sessionStorage.removeItem('advQAAFilters');
    sessionStorage.removeItem('advSITAFilters');
    sessionStorage.removeItem('verifyAppsColumnName');
    sessionStorage.removeItem('verifyAppsFilterTxt');
    sessionStorage.removeItem('advVerifyAppFilters');
    sessionStorage.removeItem('advCardPickupFilters');
    // remove accommodation filter keys
    Object.keys(sessionStorage).filter(key => key.startsWith('acc_'))
      .forEach(key => sessionStorage.removeItem(key));
    localStorage.removeItem('Printer');
  }
  constructor(@Inject(FanIDConfig) private config: Environment,private authService: AuthService,
  private router: Router,
  ) {}
  setTerminal(obj:any) {
    this.selectedTerminal = obj;
  }
  setLoginObject(obj) {
    this.loginObject = obj;
  }
  getLoginObject(){
    return this.loginObject;
  }
  setPrinter(obj:any) {
    this.selectedPrinter = obj;
  }
  getPrinter(){
    return this.selectedPrinter;
  }
//#region languageid
  public getCurrentLanguage(): string {
    return localStorage.getItem('language')?.toLowerCase()
  }
  public getCurrentLanguageId(): string {
    return localStorage.getItem('language-id')
  }
  public setUserLangague(language: any) {
    localStorage.setItem('language', language)
  }
  public setCurrentLanguageId(languageId: any) {
    localStorage.setItem('language-id', languageId)
  }
  decryptValue(value: any) {
    try {
      const langKey = localStorage.getItem('language_culture_info')
      if (langKey != null && langKey != undefined && langKey?.trim() != '') {
        const key = langKey + 'qwrsnbvsjghjerwe'
        const bytes = crypto.AES.decrypt(value, key)
        return bytes.toString(crypto.enc.Utf8)
      } else {
        return null
      }
    } catch (exp) {
      return null
    }
  }
  encryptValue(value: any) {
    try {
      const langKey = localStorage.getItem('language_culture_info')
      if (langKey != null && langKey != undefined && langKey?.trim() != '') {
        const key = langKey + 'qwrsnbvsjghjerwe'

        return crypto.AES.encrypt(value, key).toString()
      } else {
        return null
      }
    } catch (exp) {
      return null
    }
  }
  //#endregion
  logoutProperties(){
    localStorage.removeItem('accessToken');
    localStorage.removeItem('fanId');
    localStorage.removeItem('PermissionList')
    this.isLoggedIn.next(false);
    this.router.navigate(['/']);
  }
  logoutErrorProperties(){
    localStorage.removeItem('accessToken');
    localStorage.removeItem('fanId');
    localStorage.removeItem('PermissionList')

    this.isLoggedIn.next(false);
  }

  encryptLoginDetails(value: string) {
    const key = crypto.enc.Utf8.parse(this.config.passKey);
    const iv = crypto.enc.Utf8.parse(this.config.passValue);
    const b64 = crypto.AES.encrypt(crypto.enc.Utf8.parse(value), key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: crypto.mode.CBC,
        padding: crypto.pad.Pkcs7
      }).toString();
    return b64;
  }

  decryptPaymentConfirm(value: string) {
    try {
      const encryptionKey = 'jasbdjvfrygvalde';
      const iv = 'aknsdkandkansdag';
      const key = crypto.enc.Utf8.parse(encryptionKey);
      const configuration = {
        keySize: 128 / 8,
        iv: crypto.enc.Utf8.parse(iv),
        mode: crypto.mode.CBC
      };
      return crypto.AES.decrypt(value, key, configuration).toString(crypto.enc.Base64);
    } catch (error) {
      console.log(error);
    }
  }

  getAccessToken() {
    if (!this.accessToken)
      this.accessToken = JSON.parse(this.decryptValue(localStorage.getItem('accessToken')));
    return this.accessToken;
  }
}
