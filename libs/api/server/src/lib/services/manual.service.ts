import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiUrls } from '../bulk-registration-urls';
import {
  UploadManualData,
  ManualSubmissionStatus,
  ManualBulkImportData,
  ManualImportHeaderInfo,
} from '../models/manual.model';

@Injectable({
  providedIn: 'root',
})
export class ManualService {
  private apiUrl: string;
  private baseUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  
  postManualRegistrationData(data: any) {
    const url = `${this.baseUrl}` + ApiUrls.ManualRegister;
    return this.http.post<any>(url, data).pipe(
      map((postManualRegistrationData: any) => {
        return postManualRegistrationData;
      }),
      catchError((error) => {
        return throwError('Something went wrong!');
      })
    );
  }

  postManualUploadData(data: UploadManualData[]): Observable<any> {
    const url = `${this.baseUrl}` + ApiUrls.UploadManualData;
    console.log(url);
    return this.http.post<any>(url, data).pipe(
      map((postManualUploadData: any) => {
        return postManualUploadData;
      }),
      catchError((error) => {
        return throwError('Something went wrong!');
      })
    );
  }
  getImportHeaderInfo(): Observable<ManualImportHeaderInfo[]> {
    const link = `${this.baseUrl}` + ApiUrls.ManualImportHeaderInfo;
    return this.http.get<ManualImportHeaderInfo[]>(link);
  }
  getBulkImportData(): Observable<ManualBulkImportData[]> {
    const link = `${this.baseUrl}` + ApiUrls.ManualBulkImportData;
    return this.http.get<ManualBulkImportData[]>(link);
  }
  getSubmissionStatus(): Observable<ManualSubmissionStatus[]> {
    const link = `${this.baseUrl}` + ApiUrls.ManualSubmissionStatus;
    return this.http.get<ManualSubmissionStatus[]>(link);
  }
  postSelected(data: any): Observable<any> {
    const url = `${this.baseUrl}` + ApiUrls.ManualToProcess;
    return this.http.post<any>(url, data).pipe(
      map((postSelectedData: any) => {
        return postSelectedData;
      }),
      catchError((error) => {
        return throwError('Something went wrong!');
      })
    );
  }
}
