import { Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrls } from './../bulk-registration-urls';
import { DashboardEvents, IConfigurationTypeResponse } from '../models/dashboard.model';
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl: string;
  private baseUrl: string;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  getDashboardEvents(): Observable<DashboardEvents[]> {
    const link = `${this.apiUrl}` + ApiUrls.DashboardEvents;
    return this.http.get<any>(link);
  }

  getDashboardStatistics(body,isServiceCenter) {
    const link = `${this.apiUrl}` + (isServiceCenter?ApiUrls.DashboardStatistics:ApiUrls.B2BDashboardStatistics);
    return this.http.post<any>(link, body);
  }

  getImage(path) {
    return this.apiUrl + ApiUrls.GetImage + `?imagePath=${path}`;
  }
  CustomerPortalGetCardStatus(fanId:any):Observable<any>{
    const link = `${this.apiUrl}` + '/api/CustomerPortal/get-card-sataus--by-fanid'+'?fanid='+fanId;
    return this.http.get<any>(link);
  }

  getConfigurationType(keyName: string) {
    const link = this.apiUrl + `/api/ConfigurationType/getConfiguration/${keyName}`;
    return this.http.get<IConfigurationTypeResponse>(link);
  }
}
