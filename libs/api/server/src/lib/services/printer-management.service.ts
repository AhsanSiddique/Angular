import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { BaseResponse } from '../models/api.model';
import { IGetPrinterListByMacAddressRequest, IGetPrinterListByMacAddressResponse, PrinterInsert } from '../models/printer-management.model';

@Injectable({
  providedIn: 'root'
})
export class PrinterManagementService {

  private apiUrl: string;
  private baseUrl: string;
  constructor(@Inject(FanIDConfig) private config: Environment,
  private http: HttpClient) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
   }

   getPrinterList():Observable<any>{
    const link = `${this.apiUrl}` + '/api/PrinterMap/getList';
    return this.http.post<any>(link , {});
  }

  getPrinterPoolList():Observable<any>{
    const link = `${this.apiUrl}` + '/api/BulkPrintingServiceCenter/getEnabledBulkPrintingServiceCenterList';
    return this.http.get<any>(link);
  }
  getConfigurationData(id:number):Observable<any>{
    const link = `${this.apiUrl}` + '/api/MACAddressToPrinterMap/getById/' + id;
    return this.http.get<any>(link);
  }
  insertConfiguration(data:PrinterInsert){
    const link = `${this.apiUrl}` + '/api/MACAddressToPrinterMap/insert';
    return this.http.post<BaseResponse>(link , data);
  }
  updateConfiguration(data:PrinterInsert){
    const link = `${this.apiUrl}` + '/api/MACAddressToPrinterMap/update';
    return this.http.post<BaseResponse>(link , data);
  }
  deleteConfiguration(body: {id: number, system_RowVersion: string}){
    const link = this.apiUrl + '/api/MACAddressToPrinterMap/delete';
    return this.http.post<BaseResponse>(link , body);
  }
  getPrinterListByMacAddress(body: IGetPrinterListByMacAddressRequest) {
    const link = this.apiUrl + '/api/MACAddressToPrinterMap/ReadListByMacAddress';
    return this.http.post<IGetPrinterListByMacAddressResponse>(link , body);
  }
}
