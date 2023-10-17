import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../bulk-registration-urls';
import { BulkImportData, ImportHeaderInfo, SubmissionStatus, ServieCentres, UploadExcelwithData, EPackageUploadZip } from '../models/bulk-register.model';

@Injectable({
  providedIn: 'root'
})
export class BulkRegistrationService {
  private apiUrl: string;
  private baseUrl: string;

  constructor(@Inject(FanIDConfig) private config: Environment, private http: HttpClient) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  getEvents(): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.EventsTournament;
    return this.http.post<any>(link,{});
  }

  getOrganizations(): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.Organizations;
    return this.http.post<any>(link,{});
  }

  getServicecentres(): Observable<ServieCentres[]> {
    const url = `${this.apiUrl}` + ApiUrls.TerminalList;
    return this.http.post<any>(url, {});
  }

  postExcelwithdata(data:UploadExcelwithData):Observable<any> {
    const url = `${this.apiUrl}` + ApiUrls.UploadExcel;
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(data));
     bodyMap.forEach((obj,key)=>{
       formData.append(key,obj)
     });

     return this.http.post(url, formData, { headers });
  }
  getImportHeaderInfo(): Observable<ImportHeaderInfo[]> {
    const link = `${this.baseUrl}` + ApiUrls.ImportHeaderInfo;
    return this.http.get<ImportHeaderInfo[]>(link);
  }
  getBulkImportData(): Observable<BulkImportData[]> {
    const link = `${this.baseUrl}` + ApiUrls.BulkImportData;
    return this.http.get<BulkImportData[]>(link);
  }
  getSubmissionStatus(): Observable<SubmissionStatus[]> {
    const link = `${this.baseUrl}` + ApiUrls.SubmissionStatus;
    return this.http.get<SubmissionStatus[]>(link);
  }
  postSelected(data:any):Observable<any> {
    const url = `${this.apiUrl}` + ApiUrls.ToProcess;
    return this.http.post<any>(url, data);
  }

  updateOcr(payload:any):Observable<any>{
    const url =`${this.apiUrl}`+ ApiUrls.UpdateOcr;
    return this.http.post<any>(url,payload);
  }
  getImage(path){
    return this.apiUrl + ApiUrls.GetImage+ `?imagePath=${path}`;
  }
  validateBulkGroupName(payload:any){
    const link =`${this.apiUrl}`+ApiUrls.ValidateBulkGroupName;
    return this.http.post<any>(link,payload);
  }

  deleteDraft(payload:any){
    const link =`${this.apiUrl}`+ApiUrls.DeleteBulkUploadDraft;
    return this.http.post<any[]>(link,payload);
  }
  exportFailed(payload:any){
    const link =`${this.apiUrl}`+ApiUrls.ExportExcel;
    return this.http.post(link,payload,{ responseType: 'blob' as 'blob' });
  }
  exportTemplate(){
    const link =`${this.apiUrl}`+ApiUrls.ExportTemplate;
    return this.http.get(link,{ responseType: 'blob' as 'blob' });
  }
  validateQid(payload:any):Observable<any> {
    const link =`${this.apiUrl}`+ApiUrls.ValidateQid;
    return this.http.post<any[]>(link,payload);
  }

  getPackageTemplate(package_type: EPackageUploadZip) {
    const link = this.apiUrl + ApiUrls.PackageTemplate;
    const queryParams = new HttpParams().set('packageUploadZip', package_type);
    return this.http.get(link, { params: queryParams, responseType: 'blob' });
  }
}
