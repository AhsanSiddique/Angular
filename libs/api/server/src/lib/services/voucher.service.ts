import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { VoucherCodeListRequest, VoucherExcelData, IVoucherCategoryListResponse } from '../models/voucher.model';

@Injectable({
  providedIn: 'root'
})
export class VoucherService {

  private apiUrl: string;
  private baseUrl: string;
  constructor(@Inject(FanIDConfig) private config: Environment,
  private http: HttpClient) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
   }
   GenerateBulkVouchers(data:any):Observable<any>{
    const link = `${this.apiUrl}` + '/api/FifaFanIdVoucher/Generate-bulk-Vouchers';
    return this.http.post<any>(link , data);
  }
  GetListOrganizationBulkVouchers(data:any):Observable<any>{
    const link = `${this.apiUrl}` + '/api/FifaFanIdVoucher/getListByOrganizationId';
    return this.http.post<any>(link , data);
  }
  DownloadVouchersExcel(data:VoucherCodeListRequest){
    const link = `${this.apiUrl}` + '/api/FifaFanIdVoucher/generateExcel';
    //,{ headers:  {}, responseType:'blob' }
    return this.http.post(link,data,{ responseType: 'blob' as 'blob' });
  }
  // public postFileDownload(apiRoute: string, body: any, headers?: any): Observable<any> {
  //   const apiUrl = this.apiUrl + apiRoute
  //   return this.http.post(apiUrl,body, { headers: {}, responseType:'blob' });
  //   // .pipe(map((res: Response) =>{

  //   //  return res.blob()
  //   // }));
  // }
  VoucherStatistics(body):Observable<any>{
    const link = `${this.apiUrl}` + '/api/FifaFanIdVoucher/GetVoucherStatistics'
    return this.http.post(link,body);
  }
  generateVoucherCodeListExcel(body: VoucherCodeListRequest) {
    const url = this.apiUrl + '/api/CustomerCardApplication/generateExcelForVoucherBased';
    return this.http.post(url, body, { responseType: 'blob' });
  }
  generateAssignedSingleVoucher(body):Observable<any>{
    const link = `${this.apiUrl}` + '/api/FifaFanIdVoucher/V1/Insert'
    return this.http.post(link,body);
  }
  generateAssignedBulkExcel(data:VoucherExcelData):Observable<any> {
    const url = `${this.apiUrl}` + '/api/FifaFanIdVoucher/AssignedVoucherEmailFromFile';
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
  exportFailedApplications(body: {
    bulkGroupExtractId: string,
    refEvent_Code: string
  }){
    const url = this.apiUrl + '/api/FifaFanIdVoucher/ExportFailedApplications'
    return this.http.post(url, body, { responseType: 'blob' });
  }

  resendVoucher(body){
    const link = `${this.apiUrl}` + '/api/FifaFanIdVoucher/ResendVoucherNotification'
    return this.http.post(link,body);
  }
  voucherGroupNameList(RefOrganization_Id, superadmin):Observable<any>{
    let api = '/api/FifaFanIdVoucher/ReadDataListByVoucherBulkGroupNameList'
    if (!superadmin) {
      api = api + '?RefOrganization_Id=' + RefOrganization_Id
    }
    const link = `${this.apiUrl}` + api
    return this.http.post(link,{});
  }
  validateVoucherGroup(payload):Observable<any>{
      const link =`${this.apiUrl}`+'/api/FifaFanIdVoucher/ValidateVoucherBulkGroups';
      return this.http.post<any[]>(link,payload);
  }
  updateEmailID(body):Observable<any>{
    const link = `${this.apiUrl}`+'/api/FifaFanIdVoucher/ChangeVoucherEmail';
    return this.http.post<any>(link,body)
  }
  getVoucherCategoryList() {
    const link = this.apiUrl + '/api/VoucherCategory/GetAllVoucherCategoryEnabled';
    return this.http.post<IVoucherCategoryListResponse>(link,{});
  }
}
