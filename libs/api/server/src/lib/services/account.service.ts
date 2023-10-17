import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../bulk-registration-urls';
import {
  ChangePassword,
  GetProfileInfoForBulkRegisterModelDataResponse,
  GetProfileInfoForServiceCenterModelDataResponse,
  SmsAndEmailOtpModel,
  SmsOtpModel,
  UpdateProfileRequest,
  ValidateSmsOtpModel,
} from '../models/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl: string;
  private baseUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }
  updateProfile(data: UpdateProfileRequest) {
    const url = this.apiUrl + ApiUrls.ProfileUpdate;
    return this.http.post(url, data);
  }

  changePassword(data: ChangePassword): Observable<ChangePassword> {
    const url = `${this.apiUrl}` + ApiUrls.ChangePassword;
    return this.http.post<ChangePassword>(url, data)
  }

  getProfileDataBR() {
    const endpoint = ApiUrls.ProfileDataBR;
    const link = this.apiUrl + endpoint;
    return this.http.get<GetProfileInfoForBulkRegisterModelDataResponse>(link);
  }

  getProfileDataSC() {
    const endpoint = ApiUrls.ProfileDataSC;
    const link = this.apiUrl + endpoint;
    return this.http.get<GetProfileInfoForServiceCenterModelDataResponse>(link);
  }

  sendSMSOtp(body: SmsOtpModel) {
    const link = `${this.apiUrl}` + ApiUrls.otpSMSSend;
    return this.http.post<any>(link, body);
  }
  validateSMSOtp(body: ValidateSmsOtpModel) {
    const link = `${this.apiUrl}` + ApiUrls.otpSMSVerify;
    return this.http.post<any>(link, body);
  }
  forgotPassword(setPassData: any): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.ForgotPassword;
    return this.http.post<any>(link, setPassData);
  }
  customerPortalGetprofile():Observable<any>{
    const link = `${this.apiUrl}`+'/api/CustomerPortal/getProfile';
    return this.http.get<any>(link);
  }
  customerPortalSendSMSEMAILOtp(body: SmsAndEmailOtpModel) {
    const link = `${this.apiUrl}` + '/api/ServiceCenter/sendSmsAndEmailOtp';
    return this.http.post<any>(link, body);
  }
  customerPortalValidateSMSOtp(body: ValidateSmsOtpModel) {
    const link = `${this.apiUrl}` + ApiUrls.otpSMSVerify;
    return this.http.post<any>(link, body);
  }
  resetPasswordOtp(data:any):Observable<any>{
    const url = this.apiUrl + ApiUrls.ResetPasswordOtp;
    return this.http.post<any>(url, data);


}
}
