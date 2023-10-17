import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiUrls } from '../bulk-registration-urls';
import {
  AllApplicationListData,
  AllApplicationListFilter,
  CancelApplication,
  ListColumnName,
} from '../models/all-applications.model';
import { BaseResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root',
})
export class AllApplicationsService {
  private apiUrl: string;
  private baseUrl: string;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  getApplicationData(body: any): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.AllApplicationListData;
    return this.http.post<any>(link, body);
  }

  getColumnstoFilter(): Observable<ListColumnName[]> {
    const link = `${this.baseUrl}` + ApiUrls.ListColumntoFilter;
    return this.http.get<ListColumnName[]>(link);
  }

  filteredbulkColumn(
    data: AllApplicationListFilter[]
  ): Observable<AllApplicationListData[]> {
    const url = `${this.baseUrl}` + ApiUrls.FilteredColumnData;
    return this.http.post<AllApplicationListData[]>(url, data).pipe(
      map((colData: AllApplicationListData[]) => {
        return colData;
      }),
      catchError((error) => {
        return throwError(error + 'Something went wrong!');
      })
    );
  }

  getApplicantData(appNumber: any) {
    const link =
      `${this.apiUrl}` + ApiUrls.ApplicantData + '?fanid=' + appNumber;
    return this.http.get<any>(link);
  }

  getActiveCustomerCard(applicationID: string) {
    const url =
      this.apiUrl +
      `/api/CustomerCard/Get-Active-Customer-Card-By-Application-Id/${applicationID}`;
    return this.http.get<any>(url);
  }

  toggleCardStatus(body: {
    cardId: number;
    applicationId: number;
    status: boolean;
  }) {
    const url = this.apiUrl + '/api/CustomerCard/Card-EnabledOrDisabled';
    return this.http.post(url, body);
  }

  isNullOrEmpty(val: string) {
    return val == null || val == undefined || val == ''
  }
  isNullOrWhiteSpace(val: string) {
    return val == null || val == undefined || val?.trim() == ''
  }
  isNull(val: any) {
    return val == null || val == undefined
  }
  cancelApplication(body:CancelApplication):Observable<CancelApplication>{
    const url = this.apiUrl + '/api/CustomerCardApplication/cancelApplication';
    return this.http.post<CancelApplication>(url, body);
  }
  deleteDraftApps(body:CancelApplication):Observable<CancelApplication>{
    const url = this.apiUrl + '/api/CustomerCardApplication/deleteApplication';
    return this.http.post<CancelApplication>(url, body);
  }
  updateMobile(body:any):Observable<any>{
    const url = this.apiUrl + '/api/CustomerCardApplicationReg/UpdateApplicationProfile';
    return this.http.post<any>(url, body);
  }
  updateProfileImage(body:any):Observable<any>{
    const url = this.apiUrl + '/api/CustomerCardApplication/UpdateProfilePic';
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );
    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));
    bodyMap.forEach((value:any, key) =>
      {
        if(key === 'ProfilePic')
          formData.append(key, value, 'profilePic.jpg');
        else
          formData.append(key, value);
      }
    );
    return this.http.post(url, formData, { headers });
  }

  reverifyAccommodation(fanIdNo: string) {
    const url = this.apiUrl + '/api/Accommodation/ReVerifyAccommodation';
    return this.http.post<BaseResponse>(url, { fanIdNo });
  }


  updateFanCategory(data) {
    const endpoint = '/api/LSCApplicantTicketInfo/UpdateAppCategoryToMoi';
    const url = this.apiUrl + endpoint;
    return this.http.post<any>(url,data);
  }

  updateEmail(data) {
    const endpoint = '/api/CustomerCardApplication/UpdateEmailAddress';
    const url = this.apiUrl + endpoint;
    return this.http.post<any>(url,data);
  }

  checkUpdateEligibility(body: { fanIdNo: string }) {
    const endpoint = '/api/MOIRegRequest/CheckUpdateEligibility';
    const url = this.apiUrl + endpoint;
    return this.http.post<any>(url, body);
  }

  resendCompletionStatus(body: { fanIdNo: string; eventCode?: string }) {
    const endpoint = '/api/CustomerCardApplicationStatus/UpdateApplicationCompletionStatusToMOI';
    const url = this.apiUrl + endpoint;
    return this.http.post<BaseResponse>(url, body);
  }
}
