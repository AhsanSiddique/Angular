import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { ICAOFaceDetectionResponse, IPackageUploadExcelRegistrationRequest, QIDPersonalDetailsRequest, RequestFMandOCR, PackageUploadRegistrationData } from '../models/package-upload.model';

@Injectable({
  providedIn: 'root'
})
export class PackageUploadService {

  private apiUrl: string;
  private baseUrl: string;
  constructor(@Inject(FanIDConfig) private config: Environment,
  private http: HttpClient) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
   }
  
  PackageUploadRegistration(data:PackageUploadRegistrationData,youth:boolean):Observable<any> {
    let path='/api/PackageUpload/packageUploadRegistraion'
    if(youth){
      path='/api/PackageUpload/packageUploadYouthRegistraion'
    }
    const url = `${this.apiUrl}` + path;
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

  packageUploadExcelRegistration(body: IPackageUploadExcelRegistrationRequest) {
    const url = this.apiUrl + '/api/PackageUpload/uploadSeatFillingPackage';
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));
     bodyMap.forEach((obj,key)=>{
       formData.append(key,obj)
     });

     return this.http.post<any>(url, formData, { headers });
  }

  packageUploadExcelRegistrationExisting(body: IPackageUploadExcelRegistrationRequest) {
    const url = this.apiUrl + '/api/PackageUpload/uploadSeatFillingPackageToExisting';
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));
     bodyMap.forEach((obj,key)=>{
       formData.append(key,obj)
     });

     return this.http.post<any>(url, formData, { headers });
  }

  UploadPackageToBulkGroup(data:PackageUploadRegistrationData) {
    const path = '/api/PackageUpload/UploadPackageToBulkGroup'
    const url = this.apiUrl + path;
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(data));
     bodyMap.forEach((obj,key)=>{
       formData.append(key,obj)
     });

     return this.http.post<any>(url, formData, { headers });
  }
  
  getOCRandFM(body: RequestFMandOCR) {
    const link = this.apiUrl + '/api/PackageUpload/UpdateFMAndOcr';
    return this.http.post<any>(link , body);
  }
  getICAOFaceDetection(body: RequestFMandOCR) {
    const link = this.apiUrl + '/api/PackageUpload/ICAOFaceDetection';
    return this.http.post<ICAOFaceDetectionResponse>(link , body);
  }
  getQIDPersonalDetails(body: QIDPersonalDetailsRequest) {
    const link = this.apiUrl + '/api/BulkRegistrationDraft/validateQidPersonalDetails';
    return this.http.post<any>(link , body);
  }

  packageUploadFinalSubmit(body:any){
    const link = this.apiUrl + '/api/PackageUpload/Bulk-Package-Submit';
    return this.http.post<any>(link , body);
  }
  ExportFailedPackageItem(body:any){
    const link = this.apiUrl + '/api/PackageUpload/ExportFailedPackageApplications';
    return this.http.post(link,body,{ responseType: 'blob' });
  }
  checkFanid(body):Observable<any>{
    const link = this.apiUrl + '/api/CustomerCardApplication/validate-parent-fanid';
    return this.http.post<any>(link,body);
  }
  exportFailedApplicationsFromPackageExcel(body:any){
    const link = this.apiUrl + '/api/PackageUpload/ExportFailedApplicationsSFP';
    return this.http.post(link,body,{ responseType: 'blob' });
  }
}
