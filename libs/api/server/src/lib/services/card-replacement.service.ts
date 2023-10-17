import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../bulk-registration-urls';
import { CardReplacementApplicantData, CardReplacementListColumnName, CardReplacementListData } from '../models/card-replacement.model';

@Injectable({
  providedIn: 'root'
})
export class CardReplacementService {
  private apiUrl: string;
  private baseUrl: string;
  constructor(@Inject(FanIDConfig) private config: Environment,
  private http: HttpClient) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
   }
   getColumnstoFilter(): Observable<CardReplacementListColumnName[]> {
    const link = `${this.baseUrl}` + ApiUrls.CardReplacementColumntoFilter;
    return this.http.get<CardReplacementListColumnName[]>(link);
  }
  getApplicationData(body: any): Observable<CardReplacementListData[]> {
    const link = `${this.apiUrl}` + ApiUrls.CardReplacementListData;
    return this.http.post<CardReplacementListData[]>(link,body);
  }
  getApplicantData() {
    const link = `${this.baseUrl}` + ApiUrls.CardReplacementApplicantData;
    return this.http.get<CardReplacementApplicantData>(link);
  }
  CustomerCardPrinting(data:any):Observable<any>{ 
    // const link = `${this.apiUrl}` + ApiUrls.CustomerCardPrinting;
    const link = `${this.apiUrl}` + '/api/CustomerCardPrinting/v1/BulkPrintCard';
    // const getPrinter= JSON.parse(localStorage.getItem('Printer'));
      // data['printerName'] =getPrinter.printer_Name ?? '';
      // data['printerId'] =getPrinter.printer_Id ?? '';//chnage
      // data['isPrintFromServiceCentre'] = true ?? false;
    return this.http.post<any>(link , data);
  }
}
