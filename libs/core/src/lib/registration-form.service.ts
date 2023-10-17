import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApplicantService, MetadataService } from '@fan-id/api/server';
import { NgxSpinnerService } from 'ngx-spinner';
import { Environment, FanIDConfig, MenuService, ScrollService } from '..';

@Injectable({
  providedIn: 'root'
})
export class RegistrationFormService {
  baseUrl: string;
  apiUrl:string;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    public menu: MenuService,
    public applicant: ApplicantService,
    public metadata: MetadataService,
    public scroll: ScrollService,
    public spinner: NgxSpinnerService,
    private http: HttpClient

  ) {
    this.baseUrl = this.config.mockUrl;
    this.apiUrl = this.config.apiUrl;
   }

    

  
  composeImageUrl(imagePath: string, isDraft = false) {
    if (!imagePath) return '';
    const endpoint = '/api/CustomerCardApplication/getImage';
    const params = `?imagePath=${imagePath}&isDraft=${isDraft}`;
    return this.apiUrl + endpoint + params;
  }

}
