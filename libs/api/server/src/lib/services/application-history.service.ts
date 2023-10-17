import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { CustomerCardApplicationActionGetListResponsePagingResponse } from '../models/applicant.model';

@Injectable({
  providedIn: 'root',
})
export class ApplicationHistoryService {
  apiUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  getCustomerCardApplicationHistoryList(body: any) {
    const endpoint = '/api/CustomerCardApplicationHistory/get-List-by-FanID';
    const url = this.apiUrl + endpoint;
    return this.http.post<CustomerCardApplicationActionGetListResponsePagingResponse>(
      url,
      body
    );
  }
  public getApplicationActions(filter: any): Observable<any> {
    const endpoint = '/api/CustomerCardApplicationAction/getList';
    const url = this.apiUrl + endpoint;
    return this.http.post(url, filter);
  }

  public getApplicationStatus(filter: any): Observable<any> {
    const endpoint = '/api/CustomerCardApplicationStatus/getList';
    const url = this.apiUrl + endpoint;
    return this.http.post(url, filter);
  }
}
