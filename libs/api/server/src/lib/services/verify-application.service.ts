import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { BaseResponse, IPendingApplicationVerificationStatusRequest } from '../..';
import { ApiUrls } from '../bulk-registration-urls';

@Injectable({
  providedIn: 'root'
})
export class VerifyApplicationService {

  private apiUrl: string;
  constructor(@Inject(FanIDConfig) private config: Environment,
  private http: HttpClient) {
    this.apiUrl = this.config.apiUrl;
   }

  verifyApplication_UpdateStatus(body: IPendingApplicationVerificationStatusRequest) {
    const link = this.apiUrl + ApiUrls.VerifyApplicationUpdateStatus;
    return this.http.post<BaseResponse>(link , body);
  }
}
