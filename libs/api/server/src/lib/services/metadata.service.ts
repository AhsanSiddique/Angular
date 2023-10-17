import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Environment, FanIDConfig, LanguageService } from "@fan-id/core";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map, shareReplay, switchMap } from "rxjs/operators";
import { ApiUrls } from "../bulk-registration-urls";
import { ApplicationStatus } from "../models/applicant.model";
import { ServieCentres } from "../models/bulk-register.model";
import {
  MetaDataLookup,
  MetaDataLookupKeys,
  MetaDataResponseDataResponse,
  NationalityDropDownResponse,
  NationalityDropDownResponsePagingResponse,
  NationalityLookup,
  EnumTranslationItemListResponse
} from "../models/metadata.model";

export interface MetadataParams {
  languageId?: number;
  refresh?: boolean;
  filter?: boolean;
  sort?: boolean;
}

interface MetadataLookupParams extends MetadataParams {
  key: MetaDataLookupKeys;
}

interface MetadataNationalityParams extends MetadataParams {
  code?: string;
}

const ARAB_NATIONALITIES = [
  "DZ",
  "BH",
  "EG",
  "IR",
  "IQ",
  "JO",
  "KW",
  "LB",
  "LY",
  "MR",
  "MA",
  "OM",
  "PS",
  "QA",
  "SA",
  "SD",
  "SY",
  "TN",
  "AE",
  "YE",
];

const TICKET_HOLDERS = ['mth', 'MTH'] // match ticket holder
const VOUCHER_HOLDERS = ['mih', 'MIH'];
export const USERS_WITH_VIP_PRIVILEGE = ['vipone','viptwo','vipthree','vipfour','vipfive'];
export const FANID_CATEGORY_VIP = ['VIP', 'vip'];
const FANID_CATEGORY_SC = [...TICKET_HOLDERS, ...VOUCHER_HOLDERS];
const FANID_CATEGORY_BR = ['cg', 'CG'];

export const fanidCategoryFilterFn = (isServiceCentre: boolean) => (category: MetaDataLookup) => {
  if(isServiceCentre) {
    const loggedInUserHasVIPPrivilege = USERS_WITH_VIP_PRIVILEGE.includes(localStorage.getItem('userName'));
    const categoriesSC = [...FANID_CATEGORY_SC, ...(loggedInUserHasVIPPrivilege ? FANID_CATEGORY_VIP : [])];
    return categoriesSC.includes(category?.code);
  }
  return FANID_CATEGORY_BR.includes(category?.code);
}

const sortorderFn = (a: MetaDataLookup, b: MetaDataLookup) => {
  if (a.sortorder > b.sortorder) {
    return 1;
  }
  if (a.sortorder < b.sortorder) {
    return -1;
  }
  return 0;
}

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private apiUrl: string;
  private metaDataUrl = '/api/MetaData/';

  private metadata$: Observable<MetaDataResponseDataResponse>;
  private metadataCustomerCategory$: Observable<MetaDataLookup[]>;
  private dialingCodes$: Observable<NationalityDropDownResponse[]>;
  private languageId: number;
  private languageChanged = false;
  private isServiceCentre: boolean;
  private enumHttpStore = new Map<string, Observable<any>>();

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
    private languageService: LanguageService
  ) {
    this.apiUrl = this.config.apiUrl;
    this.languageId = this.languageService.languageId ?? 1;
    this.isServiceCentre = this.config.application === 'ServiceCenter';

    this.languageService.layout.subscribe((isRTL) => {
      const new_languageId = +isRTL + 1;
      this.languageChanged = new_languageId !== this.languageId;
      this.languageId = new_languageId;
    });
  }

  getMetaData({ languageId, refresh = false }: MetadataParams) {
    const endpoint = 'getMetaData';
    const _languageId = languageId ?? this.languageId;
    const params = new HttpParams().set('languageId', _languageId);
    const url = this.apiUrl + this.metaDataUrl + endpoint;

    if (
      !this.metadata$ ||
      refresh ||
      (languageId && languageId != this.languageId) ||
      this.languageChanged
    ) {
      this.languageChanged = false;
      this.metadata$ = this.http.get(url, { params }).pipe(shareReplay(1));
    }
    return this.metadata$;
  }

  getMetaDataLookup({ key, languageId, refresh, sort }: MetadataLookupParams) {
    return this.getMetaData({ languageId, refresh }).pipe(
      map((data) => {
        const lookupData = data?.data ?? {};
        if (sort) return lookupData[key]?.sort(sortorderFn);
        return lookupData[key];
      })
    );
  }

  getApplicationTypes({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'applicationType';
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getCustomerCategories({ languageId, refresh = false, filter = true }: MetadataParams) {
    const key: MetaDataLookupKeys = 'customerCategory';
    if(filter) {
      const filterFn = fanidCategoryFilterFn(this.isServiceCentre);
      return this.getMetaDataLookup({ key, languageId, refresh })
      .pipe(map(data => data.filter(filterFn)))
    }
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getDeliveryTypes({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'deliveryType';
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getDocumentTypes({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'documentType';
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getGenders({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'gender';
    return this.getMetaDataLookup({ key, languageId, refresh })
      .pipe(map(
        genders =>
        genders?.filter(gender => gender.code !== 'UNSPECIFIED')
      ))
  }

  getMedicalInformations({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'medicalInformation';
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getPassportTypes({languageId , refresh = false}: MetadataParams) {
    const key: MetaDataLookupKeys = 'passportType';
    return this.getMetaDataLookup({key, languageId, refresh})
  }

  getRegUserCategories({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'regUserCategory';
    return this.getMetaDataLookup({ key, languageId, refresh, sort: true })
      .pipe(map(user_categories =>
         user_categories.filter(user_category => user_category.isEnabled)
      ))
  }

  getTitles({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'title';
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getNationalities({
    languageId,
    refresh = false,
    code,
  }: MetadataNationalityParams = {}): Observable<NationalityLookup[]> {
    const key: MetaDataLookupKeys = 'nationality';
    if (!code) {
      return this.getMetaDataLookup({ key, languageId, refresh });
    }
    return this.getMetaDataLookup({ key, languageId, refresh }).pipe(
      switchMap((country_data: NationalityLookup[]) => {
        return this.getApplicationTypes({ languageId, refresh }).pipe(
          map((application_types) => {
            const refApplicationType_Id = application_types.find(
              (_application_type) => _application_type.code === code
            )?.id;
            return refApplicationType_Id
              ? country_data.filter(
                  (country) =>
                    country.refApplicationType_Id === refApplicationType_Id
                )
              : country_data;
          })
        );
      })
    );
  }

  getArabNationalities() {
    return ARAB_NATIONALITIES;
  }

  getNationalityCode(name: string) {
    if (!name) return of('');
    return this.getNationalities({ languageId: 1 }).pipe(
      map((nationalities) => {
        const result = nationalities?.find((nationality) => {
          let { name: _name } = nationality ?? {};
          _name = _name ? _name.toLowerCase().trim() : '';
          return _name === name.toLowerCase().trim();
        });
        return result?.code;
      })
    );
  }

  getNationalityCodeFromNatCode(natCode: string) {
    if (!natCode) return of('');
    return this.getNationalities({ languageId: 1 }).pipe(
      map((nationalities) => {
        const result = nationalities?.find((nationality) => {
          let { natCode: _natCode } = nationality ?? {};
          _natCode = _natCode ? _natCode.trim() : '';
          return _natCode === natCode.trim();
        });
        return result?.code;
      })
    );
  }

  getNationalityNatCode(code: string) {
    if (!code) return of('');
    return this.getNationalities({ languageId: 1 }).pipe(
      map((nationalities) => {
        const result = nationalities?.find((nationality) => {
          let { code: _code } = nationality ?? {};
          _code = _code ? _code.toLowerCase().trim() : '';
          return _code === code.toLowerCase().trim();
        });
        return result?.natCode;
      })
    );
  }

  getDialingCodes(refresh?: boolean) {
    const endpoint = '/api/Nationality/getDialingCodeDropDownList';
    const url = this.apiUrl + endpoint;
    if (!this.dialingCodes$ || refresh) {
      this.dialingCodes$ = this.http
        .post<NationalityDropDownResponsePagingResponse>(url, {})
        .pipe(
          map((data) => {
            return data?.dataList;
          }),
          shareReplay(1)
        );
    }
    return this.dialingCodes$;
  }

  getStaticContent({
    languageId,
    code,
  }: {
    languageId?: number;
    code: string;
  }) {
    const endpoint = '/api/StaticContent/getByCode';
    const url = this.apiUrl + endpoint;
    const _languageId = languageId ?? this.languageId;
    const params = new HttpParams()
      .set('languageId', _languageId)
      .set('code', code);

    return this.http.get(url, { params }).pipe(
      catchError((err) => {
        console.log('TermsConditions', err);
        return EMPTY;
      })
    );
  }

  getTicketHolders() {
    return TICKET_HOLDERS
  }

  getVoucherHolders() {
    return VOUCHER_HOLDERS
  }

  getServiceCentres({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'serviceCenter'
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getServicecentresList(): Observable<ServieCentres[]> {
    const url = `${this.apiUrl}` + ApiUrls.TerminalList;
    return this.http.post<any>(url, {});
  }

  getSubmissionTypeChannel(){
    const key: MetaDataLookupKeys = 'channel';
    const languageId =1 ;
    const refresh = false;
    return this.getMetaDataLookup({key, languageId, refresh})
  }

  getEnumList(name:string) {
    const url = this.apiUrl + '/api/Enum/getEnumTranslationItemList/' + name;
    if (!this.enumHttpStore.has(name)) {
      this.enumHttpStore.set(name, this.http.get<any>(url).pipe(shareReplay(1)));
    }
    return this.enumHttpStore.get(name);
  }

  getApplicationStatuses() {
    return this.getApplicationStatusDataList()
      .pipe(map(response => {
        let dataList = response?.dataList ?? [];
        dataList = dataList.map(item => {
          const { value, translation: name } = item;
          return { value, name }
        });

        const excludedStatus = [
          ...(!this.isServiceCentre ?
            [
              ApplicationStatus.Pending_Accommodation_Confirmation,
              ApplicationStatus.RequestForCorrection,
              ApplicationStatus.Pending_Verification,
              ApplicationStatus.Pending_Ticket_Verification
            ] : [
              ApplicationStatus.Draft
            ]),
        ]

        const refinedDataList = dataList.filter(obj => {
          return !excludedStatus.includes(obj?.value)
        }).map(obj => {
          if (obj?.value === ApplicationStatus.Pending_Verification) {
            return {
              value: obj.value,
              name: 'Pending (Verification Check)'
            }
          }
          return obj;
        })
        return refinedDataList;
      }))
  }

  getApplicationStatusDataList() {
    return this.getEnumList('CustomerCardApplication_ApplicationStatus')
  }

  getHayyaCardStatuses(){
    return this.getHayyaStatusDataList()
    .pipe(map(response=>{
      let dataList = response?.dataList ?? [];
        dataList = dataList.map(item => {
          const {value, translation:name} = item;
          return { value, name }
        });

        const includedStatus = [
          ...(!this.isServiceCentre ?
            [
             1,2,4,5,12
            ] : [
              3
            ]),
        ]
          const refinedDataList = dataList.filter(obj => {
            if(this.isServiceCentre)
              return !includedStatus.includes(obj?.value)
            else
              return includedStatus.includes(obj?.value)
          })
          return refinedDataList;
    }), shareReplay(1))
  }

  getHayyaStatusDataList(){
    return this.getEnumList('Card_Status')
  }

  getAccommodationTypes() {
    return this.getEnumList('AccommodationType');
  }

  getAccommodationTypesWithPending() {
    return this.getAccommodationTypes()
      .pipe(map(res => {
        let dataList = res?.dataList ?? [];
        dataList = dataList.map(item => {
          const {value, translation: name} = item;
          return { value, name }
        });
        dataList.unshift({ value: -1, name: 'Pending' });
        return dataList;
      }), shareReplay(1));
  }

  getSubmissionType(){
    return this.getSubmissionTypeList()
    .pipe(map(response=>{
      let dataList = response?.dataList ?? [];
        dataList = dataList.map(item => {
          const {value, translation:name} = item;
          return { value, name }
        });

        const excludedStatus = [
          1,3,5,6,
         ]
         const includedStatus = [
          2, 11, 9
         ]

        const refinedDataList = dataList.filter(obj => {
          if(this.isServiceCentre){
            return !excludedStatus.includes(obj?.value)
          }
          else{
            return includedStatus.includes(obj?.value)
          }
        })
        // .map(obj => {
        //    if(obj?.value === ApplicationStatus.Pending_Verification) {
        //      return {
        //        value: obj.value,
        //        name: 'Pending (Verification Check)'
        //      }
        //    }
        //    return obj;
        // })
        return refinedDataList;
    }), shareReplay(1))
  }

  getSubmissionTypeList(){
    return this.getEnumList('CustomerCardApplication_SubmissionType')
  }

  getHayyaCardCategory(){
    const endpoint = '/api/CustomerCategory/getList';
    const url = this.apiUrl + endpoint;
    return this.http.post<any>(url,{})
    .pipe(map(response=>{
      let dataList = response?.dataList ?? [];
        dataList = dataList.map(item => {
          const {code:value, name} = item;
          return { value, name }
        });

        const excludedCategory = [
          'IFESRO',
		      'IFESFS',
		      'LOI'
         ]
        const refinedDataList = dataList.filter(obj => {
            return !excludedCategory.includes(obj?.value)
        })
        return refinedDataList;
    }), shareReplay(1))
  }

  getPurposeOfVisit({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'purposeOfVisit';
    return this.getMetaDataLookup({ key, languageId, refresh });
  }

  getProfession({ languageId, refresh = false }: MetadataParams) {
    const key: MetaDataLookupKeys = 'profession';
    return this.getMetaDataLookup({ key, languageId, refresh }).pipe(
      map(professionList => {
        return professionList?.sort(({ name: name1 }, { name: name2 }) => name1.localeCompare(name2))
      })
    )
  }

  getVisaStatusList() {
    return this.getEnumList('VisaStatus')
      .pipe(map(res => {
        let dataList = res?.dataList ?? [];
        dataList = dataList.map(item => {
          const { value, translation: name } = item;
          return { value, name }
        });
        return dataList;
      }), shareReplay(1));
  }

  getMetaDataCustomerCategory({ languageId = 1, refresh = false }: MetadataParams) {
    const url = this.apiUrl + this.metaDataUrl + 'getMetaDataCustomerCategory';
    const params = new HttpParams()
      .set('languageId', languageId.toString())
      .set('refreshCache', refresh.toString());
    return this.metadataCustomerCategory$ ||= this.http.get<MetaDataResponseDataResponse>(url, { params }).pipe(
      map((response) => {
        return response?.data?.customerCategory ?? [];
      }),
      shareReplay(1)
    );
  }

  getPaymentCardTypeList(): Observable<EnumTranslationItemListResponse> {
    return this.getEnumList('Payment_CardType').pipe(
      catchError((err) => {
        console.log(err);
        return EMPTY;
      })
    )
  }

  getPaymentTransactionTypeList(): Observable<EnumTranslationItemListResponse> {
    return this.getEnumList('Payment_TransactionType').pipe(
      catchError((err) => {
        console.log(err);
        return EMPTY;
      })
    )
  }
}
