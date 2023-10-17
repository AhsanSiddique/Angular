import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CoreService, Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { ApiUrls } from '../bulk-registration-urls';
import { BulkResponse } from '../models/applicant.model';
import { CancelPrintRequest } from '../models/card-pickup.model';
import {
  CardReplacementApplicantData,
  CardReplacementListColumnName,
  CardReplacementListData,
} from '../models/card-replacement.model';

@Injectable({
  providedIn: 'root',
})
export class CardPickupService {
  private apiUrl: string;
  private baseUrl: string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
    private coreService: CoreService,
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }
  getColumnstoFilter(): Observable<CardReplacementListColumnName[]> {
    const link = `${this.baseUrl}` + ApiUrls.CardPickupFilterColumns;
    return this.http.get<CardReplacementListColumnName[]>(link);
  }
  getCardPickupData(body: any): Observable<CardReplacementListData[]> {
    const link = `${this.apiUrl}` + ApiUrls.CardReplacementListData;
    return this.http.post<CardReplacementListData[]>(link,body);
  }
  getApplicantData() {
    const link = `${this.baseUrl}` + ApiUrls.CardReplacementApplicantData;
    return this.http.get<CardReplacementApplicantData>(link);
  }
  getCardPrintList(payload: any) {
    const link = `${this.apiUrl}` + ApiUrls.CardPrintStatus;
    return this.http.post<any>(link, payload);
  }
  getCardDetailsByFanId(body:any){
    const link = `${this.apiUrl}` + ApiUrls.cardPickupPrintCardData;
    return this.http.post<any>(link, body);
  }
  composeUserImageUrl(imagePath: string, isDraft = false) {
    if (!imagePath) return '';
    const endpoint = '/api/CustomerCardApplication/getImage';
    const params = `?imagePath=${imagePath}&isDraft=${isDraft}`;
    return this.apiUrl + endpoint + params;
  }

  updateCardStatusByFanIdNumber(body:any):Observable<any>{
    const link = `${this.apiUrl}` + '/api/Card/UpdateCardStatusByFanIdNo';
    return this.http.post<any>(link, body);
  }

  updateCardStatusFromFile(body: {file: File, RefSerivceCenter_Code: string}) {
    const endpoint = '/api/Card/updateCardStatusFromFile';
    const url = this.apiUrl + endpoint;
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );
    const formData = new FormData();
    formData.append('file', body.file, body.file.name);
    formData.append('RefSerivceCenter_Code', body.RefSerivceCenter_Code);
    return this.http.post<BulkResponse>(url, formData, { headers });
  }

  cancelPrinting(body:CancelPrintRequest):Observable<CancelPrintRequest>{
    const link = `${this.apiUrl}` + '/api/CustomerCardAction/cancelAction';
    return this.http.post<any>(link, body);
  }

  generateMatchPass(body:any):Observable<any>{
    const link = `${this.apiUrl}` + '/api/MatchdayPassPrintout/InsertOrUpdate';
    return this.http.post<any>(link, body);
  }
}
