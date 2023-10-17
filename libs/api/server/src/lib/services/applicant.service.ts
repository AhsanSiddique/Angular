import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Inject, Injectable, SecurityContext } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { CoreService, Environment, FanIDConfig } from "@fan-id/core";
import { BehaviorSubject, Observable, of } from "rxjs";
import { catchError, map, shareReplay } from "rxjs/operators";
import { BaseResponse } from "../models/api.model";
import {
  CustomerCardApplicationGetListResponse,
  CustomerCardApplicationInsertRequest,
  registerFormKeyMap,
  applicantDetailKeyMap,
  CardGetByApplicationIdDataResponse,
  CustomerCardIntegrationResponseDataResponse,
  BulkRegistrationDraftGetListRequestPagingRequest,
  BulkRegistrationDraftGetListResponsePagingResponse,
  CreateBulkRegistrationDraftInsertRequestList,
  BulkResponse,
  CustomerCardApplicationGetListByFanIdRequestPagingRequest,
  CustomerCardApplicationGetListResponsePagingResponse,
  CardGetByApplicationIdPagingResponse,
  CustomerCardApplicationCardListRequest,
  MoiEhterazValidationRequest,
  CustomerCardApplicationAllListRequest,
  CustomerCardApplicationActionGetListRequestPagingRequest,
  CustomerCardApplicationActionGetListResponsePagingResponse,
  EntryPermitHistoryRequest,
  EntryPermitHistoryResponse,
  EntryPermitSendEmailRequest,
  IValidateEmailPhoneDocumentRequest,
  EntryPermitStatusRequest,
  EntryPermitStatusResponse,
  SACSStatusResponse,
  CustomerBorderEntryStatusResponse,
  IValidateHayyaAppCreateEligibilityRequest,
  IValidateHayyaAppCreateEligibilityResponse,
  PaymentDetailsByFanIdResponse
  // EhterazResponseData,
  // EhterazResponse
} from "../models/applicant.model";
import { IRegulaDetectFaceResponse, IRegulaPassportOCR } from "../models/ocr.model";

@Injectable({
  providedIn: 'root',
})
export class ApplicantService {
  private applicant_data = new BehaviorSubject({
    count: 0,
    selected: 0,
    applicants: [],
  });

  public applicant_data$ = this.applicant_data.pipe(shareReplay(1));

  apiUrl: string;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
    private coreService: CoreService,
    private sanitizer: DomSanitizer
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  composeApplicationInsertRequest(formValue: { [key: string]: any }) {
    return Object.entries(formValue).reduce((prev, curr) => {
      const [key, val] = curr;
      if (key in registerFormKeyMap) {
        const requestKey = registerFormKeyMap[key];
        prev[requestKey] = val;
      }
      return prev;
    }, {});
  }

  composeApplicantDetail(
    applicantData: CustomerCardApplicationGetListResponse
  ): any {
    const _applicantDetailKeyMap = Object.entries(applicantDetailKeyMap).reduce(
      (prev, curr) => {
        const [key, val] = curr;
        prev[val] = key;
        return prev;
      },
      {}
    );
    return Object.entries(applicantData).reduce((prev, curr) => {
      const [key, val] = curr;
      if (key in _applicantDetailKeyMap) {
        const applicantKey = _applicantDetailKeyMap[key];
        prev[applicantKey] = val;
      }
      return prev;
    }, {});
  }

  getApplicantDetailsByFanId(fanID: string) {
    const params = new HttpParams().set('fanid', fanID);
    const endpoint = '/api/CustomerCardApplication/get-by-fanid';
    const apiUrl = this.apiUrl + endpoint;
    return this.http.get(apiUrl, { params });
  }

  getActiveCustomerCard(applicationID: string) {
    const url =
      this.apiUrl +
      `/api/CustomerCard/Get-Active-Customer-Card-By-Application-Id/${applicationID}`;
    return this.http.get<CardGetByApplicationIdDataResponse>(url);
  }

  getCardIntegrationStatusByApplicationId(id: string) {
    const url =
      this.apiUrl +
      '/api/CustomerCardIntegration/get-Integration-Status-By-ApplicationId-Or-FanId';
    const params = new HttpParams().set('value', id).set('searchby', 1);

    return this.http.post<CustomerCardIntegrationResponseDataResponse>(
      url,
      {},
      { params }
    );
  }

  composeImageUrl(imagePath: string, isDraft = false) {
    if (!imagePath) return '';
    const endpoint = '/api/CustomerCardApplication/getImage';
    const params = `?imagePath=${imagePath}&isDraft=${isDraft}`;
    return this.apiUrl + endpoint + params;
  }

  getImageSafeUrl(imagePath: string, isDraft = false) {
    const endpoint = '/api/CustomerCardApplication/getImage';
    const params = `?imagePath=${imagePath}&isDraft=${isDraft}`;
    const url = this.apiUrl + endpoint + params;
    return this.http.get(url, { responseType: 'blob' })
      .pipe(
        map(res => {
          return this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(res))
        })).toPromise();
  }

  getResourceSafeUrl(resourcePath: string, isDraft = false) {
    const endpoint = '/api/CustomerCardApplication/getImage';
    const params = `?imagePath=${resourcePath}&isDraft=${isDraft}`;
    const url = this.apiUrl + endpoint + params;
    return this.http.get(url, { responseType: 'blob' })
      .pipe(map(res => {
        return this.sanitizer.sanitize(
          SecurityContext.RESOURCE_URL,
          this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(res))
        )
      })).toPromise();
  }

  getImageBlob(imageUrl: string) {
    const headers = new HttpHeaders()
    .set(
      'Accept',
      'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*'
    )
    return this.http.get(imageUrl, { headers, responseType: 'blob' });
  }

  register(body: CustomerCardApplicationInsertRequest, { isVerify = false, isAccreditation = false } = {}) {
    let endpoint = '/api/CustomerCardApplication/register';
    if (isVerify) endpoint = '/api/CustomerCardApplication/register-Application-Verify';
    if (isAccreditation) endpoint = '/api/AccreditationApplication/AccreditationInsertOrUpdate';

    const url = this.apiUrl + endpoint;
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));

    bodyMap.forEach((value, key) => {
      if(key=='AccommodationTypeSelected' && value == null)
      {
        value = '';
      }
      const image_paths = ['ProfilePic', 'DocImageFront', 'DocImageBack', 'AccommodationPic'];
      if (image_paths.includes(key) && value)
        formData.append(key, value, `${key.toLowerCase()}.jpg`);
      else
        formData.append(key, value);
    });
    return this.http.post(url, formData, { headers });
  }

  CustomerPortalRegister(body: CustomerCardApplicationInsertRequest) {
    const endpoint = '/api/ServiceCenter/register';
    const url = this.apiUrl + endpoint;
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));
    bodyMap.forEach((value, key) =>
      {
        if(key === 'ProfilePic')
          formData.append(key, value, 'profilePic.jpg');
        else
          formData.append(key, value);
      }
    );
    return this.http.post(url, formData, { headers });
  }

  addApplicantToBulkDraft(body: CustomerCardApplicationInsertRequest, { isAccreditation = false } = {}) {
    let endpoint = '/api/BulkRegistrationDraft/Insert-or-Update';
    if (isAccreditation) {
      endpoint = '/api/AccreditationApplication/AccreditationInsertOrUpdate';
    }
    const url = this.apiUrl + endpoint;
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );

    const formData = new FormData();
    const bodyMap = new Map(Object.entries(body));
    bodyMap.forEach((value, key) => {
      const image_paths = ['ProfilePic', 'DocImageFront'];
      if (image_paths.includes(key) && value)
        formData.append(key, value, `${key.toLowerCase()}.jpg`);
      else
        formData.append(key, value);
    });
    return this.http.post(url, formData, { headers });
  }

  getApplicantFromDraft(id: string,isFromDraft=true) {
    const endpoint = '/api/BulkRegistrationDraft/get-By-Id';
    const params = new HttpParams()
      .set("id", id)
      .set("isFromDraft", isFromDraft)
    const url = this.apiUrl + endpoint;
    return this.http.get(url, { params })
    .pipe(map((response: any) => {
      const { data } = response ?? {};
      const err = data ? {} : { error: 'Applicant Detail Not Found' };
      return {
        data,
        ...err
       }
    }),
    catchError(err => {
      console.log('ApplicantDetail Draft', err)
      return of({
        data: null,
        error: err?.error?.message || 'Something went wrong!'
      })
    }))
  }

  deleteApplicantFromBulkDraft(body: {id: number, system_RowVersion: string}) {
    const endpoint = '/api/BulkRegistrationDraft/delete';
    const url = this.apiUrl + endpoint;
    return this.http.post(url, body);
  }

  getBulkRegistrationDraftList(body: BulkRegistrationDraftGetListRequestPagingRequest) {
    const endpoint = '/api/BulkRegistrationDraft/get-List'
    const url = this.apiUrl + endpoint;
    return this.http.post<BulkRegistrationDraftGetListResponsePagingResponse>(url, body);
  }

  submitBulkregistrationDraft(body: CreateBulkRegistrationDraftInsertRequestList, { isAccreditation = false } = {}) {
    let endpoint = '/api/BulkRegistrationDraft/Bulk-Registration-Submit';
    if (isAccreditation) {
      endpoint = '/api/AccreditationApplication/Accreditation-Bulk-Registration-Submit';
    }
    const url = this.apiUrl + endpoint;
    return this.http.post<BulkResponse>(url, body);
  }

  getDependentList(body: CustomerCardApplicationGetListByFanIdRequestPagingRequest) {
    const endpoint = '/api/CustomerCardApplication/get-Dependent-List';
    const url = this.apiUrl + endpoint;
    return this.http.post<CustomerCardApplicationGetListResponsePagingResponse>(url, body);
  }

  getCustomerCardList(applicationID: string) {
    const url =
      this.apiUrl +
      `/api/CustomerCard/get-card-details-by-application-Id`;
      const params = new HttpParams()
      .set("applicationId", applicationID)
    return this.http.get<CardGetByApplicationIdPagingResponse>(url, { params });
  }

  CustomerPortalValidateTicket(tktNo:any):Observable<any>{
    const link = `${this.apiUrl}` + '/api/ServiceCenter/validate-Ticket-Number/'+tktNo;
    return this.http.get<any>(link);
  }

  customerPortalValidateEmailPhoneDocument(body:IValidateEmailPhoneDocumentRequest) {
    const link = this.apiUrl + '/api/CustomerCardApplication/Check-Email-Or-Phone-Or-Document-Exists';
    return this.http.post<BaseResponse>(link,body);
  }

  ValidateTicket(value: string) {
    const body = { ticketType: 2, value };
    const url = this.apiUrl + '/api/FifaTicketDetails/V1/validate-Ticket-FileId';
    return this.http.post(url, body);
  }

  ValidateOrderID(value: string, extras: { fanid?: string, categoryCode?: string }) {
    const body = { ticketType: 1, value, ...extras };
    const url = this.apiUrl + '/api/FifaTicketDetails/V1/validate-Ticket-FileId';
    return this.http.post(url, body);
  }

  ValidateVoucherCode(
    voucherCode: string,
    extras: {
      categoryCode?: string,
      refEvent_Code?: string,
      email?: string,
      fanid?: string
    }) {
    const url = this.apiUrl + '/api/FifaFanIdVoucher/V1/validate-Voucher-Code';
    const body = {
      voucherCode,
      ...extras
    }
    return this.http.post(url, body);
  }

  ValidateHayyaVoucherCode(
    voucherCode: string,
    extras: {
      categoryCode?: string,
      refEvent_Code?: string,
      email?: string,
      fanid?: string
    }) {
    const url = this.apiUrl + '/api/FifaHayyaWithMeVoucher/V1/validate-Hayya-Voucher-Code';
    const body = {
      voucherCode,
      ...extras
    }
    return this.http.post(url, body);
  }

  ValidateHospitalityCode(code: string) {
    const url = this.apiUrl + '/api/FifaHospitalityDetails/Validate-MHCode-Number/' + code;
    return this.http.get(url);
  }

  generateExcelForCardStatus(body: CustomerCardApplicationCardListRequest) {
    const url = this.apiUrl + '/api/CustomerCardApplication/generateExcelforCardStatus';
    return this.http.post(url, body, { responseType: 'blob' });
  }

  generateDefaultBiomatchID() {
    const str = btoa('OCRFAILED');
    const env = btoa(this.config.application);
    // const timestamp = Date.now().toString(36);
    const userName = btoa(localStorage.getItem('userName') ?? 'username');
    return btoa(str + env + userName).substring(0,75);
  }

  validatePersonalDetails(body: MoiEhterazValidationRequest) {
    const url = this.apiUrl + '/api/ServiceCenter/validatePersonalDetails';
    return this.http.post(url, body);
  }

  generateExcelAllList(body: CustomerCardApplicationAllListRequest) {
    const url = this.apiUrl + '/api/CustomerCardApplication/generateExcel';
    return this.http.post(url, body, { responseType: 'blob' });
  }

  generateExcelDraftList(body: any) {
    const url = this.apiUrl + '/api/BulkRegistrationDraft/generateExcel';
    return this.http.post(url, body, { responseType: 'blob' });
  }

  getCustomerCardApplicationActionList(body: CustomerCardApplicationActionGetListRequestPagingRequest) {
    const endpoint = '/api/CustomerCardApplicationAction/getList';
    const url = this.apiUrl + endpoint;
    return this.http.post<CustomerCardApplicationActionGetListResponsePagingResponse>(url, body);
  }

  getEntryPermitHistory(body: EntryPermitHistoryRequest) {
    const endpoint = '/api/EntryPermit/getEntryPointEmailSentTime';
    const url = this.apiUrl + endpoint;
    return this.http.post<EntryPermitHistoryResponse>(url, body);
  }

  getEntryPermitStatus(body: EntryPermitStatusRequest) {
    const endpoint = '/api/EntryPermit/getEntryPointEmailSentStatus';
    const url = this.apiUrl + endpoint;
    return this.http.post<EntryPermitStatusResponse>(url, body);
  }

  sendEntryPermitEmail(body: EntryPermitSendEmailRequest) {
    const endpoint = '/api/EntryPermit/sendEntryPointEmailAndMarkForOneFanIdNo';
    const url = this.apiUrl + endpoint;
    return this.http.post<BaseResponse>(url, body);
  }

  getEntryPermitPreviewURL(fanIdNo: string) {
    const endpoint = '/api/EntryPermit/entryPermit_Preview';
    const url = this.apiUrl + endpoint;
    return this.http.post(url, { fanIdNo }, { responseType: 'blob' })
      .pipe(map(res => {
        return this.sanitizer.sanitize(
          SecurityContext.RESOURCE_URL,
          this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(res))
        )
      })).toPromise();
  }

  detectFaceByFile(profileImage: File) {
    const url = this.apiUrl + '/api/Regula/detect-face-file';
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );
    const formData = new FormData();
    formData.append('ProfileImage',profileImage);
    return this.http.post<IRegulaDetectFaceResponse>(url, formData, { headers });
  }

  getPassportOCR({ profilePic, passportPic }: { [key: string]: File }) {
    const url = this.apiUrl + '/api/Regula/ocr-facematch-file';
    const headers = new HttpHeaders().set(
      'content-type',
      'multipart/form-data'
    );
    const formData = new FormData();
    if (profilePic?.name) {
      formData.append('profilePic',profilePic);
    } else {
      const fileExtension = profilePic?.type.split('/')[1];
      formData.append('profilePic',new File([profilePic], `user_image.${fileExtension}`));
    }
    formData.append('passportPic',passportPic);
    return this.http.post<{data: IRegulaPassportOCR, status: number}>(url, formData, { headers });
  }

  // getUserEhterazStatus(body: any) {
  //   const endpoint = '/api/Mobile/ehterazstatus';
  //   const url = this.apiUrl + endpoint;
  //   return this.http.post<EhterazResponse>(url, body);
  // }

  getHayyaWithMeList(body: any) {
    const endpoint = '/api/FifaHayyaWithMeVoucher/getListByHostRefApplication_Id';
    const url = this.apiUrl + endpoint;
    return this.http.post<any>(url, body);
  }

  updateGCCAccommodationStatus(body: { FANID: string, DocumentIdNo: string, applicationStatus: string }) {
    const endpoint = '/api/CustomerCardApplicationReg/UpdateGCCAccommodationStatus';
    const url = this.apiUrl + endpoint;
    return this.http.post<BaseResponse>(url, body);
  }

  getSACSStatus(body: { fanIdNo: string }) {
    const endpoint = '/api/Sacs/GetLastApplicationByFanID';
    const url = this.apiUrl + endpoint;
    return this.http.post<SACSStatusResponse>(url, body);
  }

  getCustomerBorderEntryStatus(fanIdNo: string) {
    const endpoint = '/api/CustomerBorderEntryStatus/getFanEntryStatus';
    const url = this.apiUrl + endpoint + '/' + fanIdNo;
    return this.http.get<CustomerBorderEntryStatusResponse>(url);
  }

  validateHayyaAppCreateEligibility(body: IValidateHayyaAppCreateEligibilityRequest) {
    const endpoint = '/api/MOIRegRequest/ValidateHayyaAppCreateEligibility';
    const url = this.apiUrl + endpoint;
    return this.http.post<IValidateHayyaAppCreateEligibilityResponse>(url, body);
  }

  getEntryFlagStatus(fanIdNo: any) {
    const endpoint = '/api/CustomerCardApplication/getVisaInfoByFanIdNo';
    const url = this.apiUrl + endpoint ;
    return this.http.post<any>(url,fanIdNo);
  }

  getPaymentDetailsByFanId(fanIdNo: string) {
    const endpoint = '/api/HayyaWithMePayment/getByFanIdNo';
    const url = this.apiUrl + endpoint;
    return this.http.post<PaymentDetailsByFanIdResponse>(url, { fanIdNo });
  }

}
