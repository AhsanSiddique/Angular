import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { IUpdateGuestDetailsRequest, IUpdateHostEmailRequest } from '../models/accomadation.model';
import { BaseResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class AccomadationService {
  private apiUrl: string;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  accommodationStatistics(body) {
    const link = `${this.apiUrl}` + '/api/Accommodation/AccommodationStatistics';
    return this.http.post<any>(link, body);
  }

  downloadAccommodationExcel(body: any, apiName:string) {
    const url = this.apiUrl + apiName;
    return this.http.post(url, body, { responseType: 'blob' });
  }

  updateGuestDetails(body: IUpdateGuestDetailsRequest) {
    const link = this.apiUrl + '/api/FriendsAndFamilyHostDetails/UpdateGuestDetails';
    return this.http.post<BaseResponse>(link, body);
  }

  updateHostEmail(body: IUpdateHostEmailRequest) {
    const link = this.apiUrl + '/api/FriendsAndFamilyHostDetails/UpdateHostEmailAddress';
    return this.http.post<BaseResponse>(link, body);
  }

  verifyGuest(body: {guestDocumentNumber: string, guestNationality_Code: string}) {
    const link = this.apiUrl + '/api/FriendsAndFamilyHostDetails/VerifyGuest';
    return this.http.post<BaseResponse>(link, body);
  }
}
