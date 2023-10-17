import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { BaseResponse } from '../models/api.model';
import { IUpdateAccommodationStatusRequest } from '../models/verify-accommodation.model';

@Injectable({
  providedIn: 'root'
})
export class VerifyAccommodationService {

  private apiUrl: string;
  constructor(@Inject(FanIDConfig) private config: Environment,
  private http: HttpClient) {
    this.apiUrl = this.config.apiUrl;
   }

  updateAccommodationStatus(body: IUpdateAccommodationStatusRequest) {
    const link = this.apiUrl + '/api/OtherAccommodation/UpdateOtherAccommodationStatus';
    return this.http.post<BaseResponse>(link , body);
  }
}
