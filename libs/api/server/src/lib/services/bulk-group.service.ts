import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiUrls } from '../bulk-registration-urls';
import {
  BulkGroupData,
  BulkGroupFilter,
  AllApplicationData,
  AllApplicationFilter,
  columnName,
  CustomerCardApplicationGetListRequestByOrganization,
  EventGetStatisticsResponeDataResponse,
  OrganizationGetByIdResponseDataResponse,
  UpdateBulkGroupAccommodationDetailsRequest,
} from '../models/bulk-group.model';

@Injectable({
  providedIn: 'root'
})
export class BulkGroupService {
  private apiUrl: string;
  private baseUrl: string;

  constructor(@Inject(FanIDConfig) private config: Environment, private http: HttpClient) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  getOrganizations(): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.Organizations;
    return this.http.post<any>(link,{});
  }
  getBulkGroups(Id:any): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.BulkGroups+ '?eventCode=';
    return this.http.get<any>(link+Id);
  }
  getApplicationStatistics(body: CustomerCardApplicationGetListRequestByOrganization) {
    const link = this.apiUrl + ApiUrls.ApplicationStatistics;
    return this.http.post<EventGetStatisticsResponeDataResponse>(link, body);
  }
  getApplicationData(): Observable<AllApplicationData[]> {
    const link = `${this.baseUrl}` + ApiUrls.AllApplicationData;
    return this.http.get<AllApplicationData[]>(link);
  }
  getColumnstoFilter(): Observable<columnName[]> {
    const link = `${this.baseUrl}` + ApiUrls.ColumntoFilter;
    return this.http.get<columnName[]>(link);
  }
  onLoadBulkGroup(body:any): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.BulkGroupData;
    return this.http.post<any>(link,body);
  }

  GetBulkGroupList(body:any): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.GetBulkGroupList;
    return this.http.post<any>(link,body);
  }

  filteredbulkGroup(data:BulkGroupFilter[]):Observable<BulkGroupData[]>{
    const url = `${this.baseUrl}` + ApiUrls.FilteredBulkGroupData;
    return this.http.post<BulkGroupData[]>(url, data).pipe(map((bulkData: BulkGroupData[]) => {
      return bulkData;
    }), catchError(error => {
      return throwError(error + 'Something went wrong!');
    }));
  }
  filteredbulkColumn(data:AllApplicationFilter[]):Observable<AllApplicationData[]>{
    const url = `${this.baseUrl}` + ApiUrls.FilteredColumnData;
    return this.http.post<AllApplicationData[]>(url, data).pipe(map((allAppData: AllApplicationData[]) => {
      return allAppData;
    }), catchError(error => {
      return throwError(error + 'Something went wrong!');
    }));
  }
  getOrganization(id: number) {
    const link = this.apiUrl + ApiUrls.Organization + `/${id}`;
    return this.http.get<OrganizationGetByIdResponseDataResponse>(link);
  }
  getPackageUploadList(body) {
    const link = this.apiUrl + ApiUrls.PackageUploadList;
    return this.http.post<any>(link, body);
  }
  updateBulkGroupAccommodationDetails(body: UpdateBulkGroupAccommodationDetailsRequest) {
    const link = this.apiUrl + ApiUrls.UpdateBulkGroupAccommodationDetails;
    return this.http.post<any>(link, body);
  }
}
