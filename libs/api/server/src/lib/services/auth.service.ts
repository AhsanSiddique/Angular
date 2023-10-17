import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable, throwError } from 'rxjs';
import { ApiUrls } from '../bulk-registration-urls';
import { ApiUrls as AmirCupApiUrls } from '../amir-cup-urls';
import { Login, LoginSuccess } from '../models/auth.model';
import { map, catchError } from 'rxjs/operators';
import * as crypto from 'crypto-js'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl: string;
  private baseUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  login(data: Login): Observable<LoginSuccess[]> {
    const url = `${this.apiUrl}` + ApiUrls.Login;
    return this.http.post<LoginSuccess[]>(url, data).pipe(
      map((loginData: LoginSuccess[]) => {
        return loginData;
      }),
      catchError((error) => {
        return throwError('Something went wrong!');
      })
    );
  }
  loginServiceCenter(data:any):Observable<any>{
    const url = `${this.apiUrl}` + ApiUrls.LoginSC;
    return this.http.post<any>(url, data);
  }
  loginBulkRegister(data:any):Observable<any>{
    const url = `${this.apiUrl}` + ApiUrls.LoginBr;
    return this.http.post<any>(url, data);
   }
  getTerminalList(payload:any): Observable<any> {
    const url = `${this.apiUrl}` + ApiUrls.TerminalList;
    return this.http.post<any>(url, payload);
  }

  getPrinterList(payload:any): Observable<any> {
    const url = `${this.apiUrl}` + ApiUrls.PrinterList;
    return this.http.post<any>(url, payload);
  }

  sendForgotEmail(setPassData:any):Observable<any>{
    const link = `${this.apiUrl}` + ApiUrls.sendforgotEmail;
    return this.http.post<any>(link, setPassData);
  }

  customerPortalChangePassword(data:any):Observable<any>{
    const link = this.apiUrl + '/api/CustomerPortal/changePassword';
    return this.http.post<any>(link, data);
  }

  customerPortalLogin(data:any):Observable<any>{
    const url = this.apiUrl + '/api/CustomerPortalAccount/login';
    const headers = new HttpHeaders().set(
      'Authorization',
      'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
    );
    return this.http.post<any>(url, data,{headers});
  }

  customerPortalSendForgotEmail(setPassData:any):Observable<any>{
    const link = this.apiUrl + '/api/CustomerPortalAccount/sendForgotPasswordEmail';
    const headers = new HttpHeaders().set(
      'Authorization',
      'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
    );
    return this.http.post<any>(link, setPassData,{headers});
  }

  customerPortalValidateResetPasswordCode(Code: string) {
    const url = this.apiUrl + AmirCupApiUrls.ValidateLink;
    const headers = new HttpHeaders().set(
      'Authorization',
      'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
    );
    return this.http.post(url, { Code }, { headers });
  }

  customerPortalForgotPassword(body: { Code: string, Password: string, RePassword: string }) {
    const url = this.apiUrl + AmirCupApiUrls.forgotPassword;
    const headers = new HttpHeaders().set(
      'Authorization',
      'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
    );
    return this.http.post(url, body, { headers });
  }

  composeCustomerPortalImageUrl(imagePath: string, addToken = true) {
    if (!imagePath) return '';
    const endpoint = '/api/Image/getImageCustomerPortal';
    const token = JSON.parse(this.decryptValue(localStorage.getItem('accessToken')));;
    const params = `?imagePath=${imagePath}` + (addToken ? `&token=Bearer%20${token}` : '');
    return this.apiUrl + endpoint + params;
  }

  composeImageUrl(imagePath: string, addToken = true) {
    if (!imagePath) return '';
    const endpoint = ApiUrls.GetImage;
    const params = `?imagePath=${imagePath}`;
    return this.apiUrl + endpoint + params;
  }

  logOutSCBR(): Observable<any>{
    const link = this.apiUrl + '/api/Account/logout';
    return this.http.post<any>(link, {});
  }
  customerPortalLogout(): Observable<any>{
    const link = this.apiUrl + '/api/CustomerPortalAccount/logout';
    return this.http.post<any>(link, {});
  }
  getUserPermissions():Observable<any>{
    const link =`${this.apiUrl}` + ApiUrls.UserPermissions;
    return this.http.get<any>(link);
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


  // SSO Login Services

  validateUserInvite(data:any):Observable<any>{
    const url = this.apiUrl + ApiUrls.ValidateUserInvite;
    return this.http.post<any>(url, data);
  }

  getDailingCodes(req:any):Observable<any>{
    const url = this.apiUrl + ApiUrls.DailingCode;
    return this.http.post<any>(url,req)
  }

  signupUser(data:any):Observable<any>{
    const url = this.apiUrl + ApiUrls.SignUp;
    return this.http.post<any>(url, data);
  }

  sendForgotOtp(data:any):Observable<any>{
    const url = this.apiUrl + ApiUrls.SendOtp;
    return this.http.post<any>(url, data);

  }

  postResetPassword(data:any):Observable<any>{
    const url = this.apiUrl + ApiUrls.ForgotPasswordOtp;
    return this.http.post<any>(url, data);

  }

  //End

  getipAddress_1(): Observable<any>{
    return this.http.get<any>('https://api.ipify.org?format=json');
  }

  getipAddress_2(): Observable<any>{
    return this.http.get<any>('https://www.geolocation-db.com/json/');
  }

  getAccessToken(data:any):Observable<any>{
    const url= this.apiUrl +ApiUrls.GetAccessToken;
    return this.http.post<any>(url,data)
  }

  resendLoginOtp(data:any):Observable<any>{
    const url=this.apiUrl + ApiUrls.ResendLoginOTP;
    return this.http.post<any>(url,data)
  }

  onboardOrganization(data:any):Observable<any>{
    const url=this.apiUrl + ApiUrls.OnBoardOrganization;
    return this.http.post<any>(url,data)
  }

  editOrganization(data:any):Observable<any>{
    const url=this.apiUrl + ApiUrls.EditOrganization;
    return this.http.post<any>(url,data)
  }

  validateOrganization(data:any):Observable<any>{
    const url=this.apiUrl + ApiUrls.ValidateOrganization;
    return this.http.post<any>(url,data);
  }

  submitOrganization(data:any):Observable<any>{
    const url=this.apiUrl + ApiUrls.SubmitOrganization;
    return this.http.post<any>(url,data);
  }
}
