import { Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { Environment, FanIDConfig } from '@fan-id/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrls } from './../bulk-registration-urls';
import { ActiveConferenceEventListResponse, ConferenceApplicationRulesListResponse, ConferencesByCodeResponse, IOrgSignupOrgAddUserInvitationRequest } from '../models/organization.model';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl: string;
  private baseUrl: string;
  private conferenceEventList$: Observable<ActiveConferenceEventListResponse>;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient
  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
  }

  resendOrganizationInvite(payload): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.ResendOrganizationInvite;
    return this.http.post<any>(link,payload);
  }

    resendUserInvite(payload): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.ResendUserInvite;
    return this.http.post<any>(link,payload);
  }

  getOrgListbyId(payload):Observable<any>{
    const link = `${this.apiUrl}` + ApiUrls.GetOrgListById +"\\"+payload;
    return this.http.get<any>(link);
  }
  getOrgByID(payload):Observable<any>{
    const link = `${this.apiUrl}` + ApiUrls.GetOrgById +"\\"+payload;
    return this.http.get<any>(link);
  }
  downloadTemplate(): Observable<any>{
    const link= `${this.apiUrl}`+ ApiUrls.DownloadOrgTemplate;
    return this.http.get(link,{ responseType: 'blob' as 'blob' });
  }

  inviteNewUser(payload: IOrgSignupOrgAddUserInvitationRequest):Observable<any>{
    const link = `${this.apiUrl}` + ApiUrls.InviteOrgUser;
    return this.http.post<any>(link,payload);
  }

  getUserCategoryList():Observable<any>{
    const link = `${this.apiUrl}` + ApiUrls.GetCategoryList;
    return this.http.post<any>(link,{});
  }
  getOrganizationCategoryList():Observable<any>{
    const link =`${this.apiUrl}` + ApiUrls.GetOrganzationCategoryList;
    return this.http.post<any>(link,{});
  }
  editOrganizationUserAppCount(payload:any):Observable<any>{
    const link =`${this.apiUrl}` + ApiUrls.EditOrganizationUserAppCount;
    return this.http.post<any>(link,payload);
  }
  getVoucherCategoryEnabledList():Observable<any>{
    const link =`${this.apiUrl}` +'/api/VoucherCategory/GetAllVoucherCategoryEnabled';
    return this.http.post<any>(link,{});
  }

  getActiveConferenceEventList({ cache = true } = {}) {
    const link = this.apiUrl + ApiUrls.GetActiveConferenceEventList;
    if (cache) {
      return this.conferenceEventList$ ||= this.http.get<ActiveConferenceEventListResponse>(link).pipe(
        shareReplay(1)
      );
    }
    return this.http.get<ActiveConferenceEventListResponse>(link,{});
  }

  getConferencesByCode(code: string) {
    const link = this.apiUrl + ApiUrls.GetConferencesByCode;
    return this.http.get<ConferencesByCodeResponse>(link, { params: { code } });
  }

  getConferenceFieldsAndRules(ServiceId: string) {
    const link = this.apiUrl + ApiUrls.GetConferenceFieldsAndRules;
    return this.http.get<ConferenceApplicationRulesListResponse>(link, { params: { ServiceId } });
  }
}
