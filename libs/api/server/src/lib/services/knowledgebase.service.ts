import { Observable } from 'rxjs';
import { Inject, Injectable } from '@angular/core';
import { CoreService, Environment, FanIDConfig } from '@fan-id/core';
import { HttpClient } from '@angular/common/http';
import { ApiUrls } from './../bulk-registration-urls';

@Injectable({
  providedIn: 'root'
})
export class KnowledgebaseService {
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

  getDocuments(payload): Observable<any> {
    const link = `${this.apiUrl}` + ApiUrls.GetKnowledgeBaseDocuments;
    return this.http.post<any>(link,payload);
  }

  downloadDoucment(path): Observable<any>{
    const link= `${this.apiUrl}`+ ApiUrls.DownloadDocument+`?Filepath=${path}`;
    return this.http.get(link,{ responseType: 'blob' as 'blob' });
  }

  getFAQcategoryList(payload): Observable<any> {
    const link = `${this.apiUrl}` + '/api/FAQ_Category/getList';
    return this.http.post<any>(link,payload);
  }
  getFAQitemsList(payload): Observable<any>{
    const link = `${this.apiUrl}` + '/api/FAQ/getList';
    return this.http.post<any>(link,payload);
  }

  composeUserImageUrl(imagePath: string, isDraft = false) {
    if (!imagePath) return '/assets/images/fifa-cup.png';
    const endpoint = '/api/CustomerCardApplication/getImage';
    const params = `?imagePath=${imagePath}&isDraft=${isDraft}`;
    return this.apiUrl + endpoint + params;
  }
}
