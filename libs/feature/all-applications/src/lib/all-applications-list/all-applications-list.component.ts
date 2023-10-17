import {
  AfterViewInit,
  Component,
  OnDestroy,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
  HostListener,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AllApplicationListData,
  AllApplicationsService,
  ApplicationStatus,
  ApplicationStatusList,
  CancelApplication,
  FanIdCardStatusList,
  FANID_CATEGORY_VIP,
  ListColumnName,
  MetaDataLookup,
  MetadataParams,
  MetadataResolve,
  MetadataService,
  NationalityLookup,
  TournamentType,
  USERS_WITH_VIP_PRIVILEGE,
  OrganizationService,
  ActiveConferenceEventListResponse,
  ActiveConferenceEvent,
} from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Environment,
  FanIDConfig,
  LanguageService,
  MenuService,
} from '@fan-id/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { catchError, map, take } from 'rxjs/operators';
import * as moment from 'moment';
import { convertDateDDMMYYYYToMMDDYYYY, convertDateStringToNgbDate, convertNgbDateToDDMMYYYY, FWC_MAX_DATE, toJSDate } from '@fan-id/shared/utils/date';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { EDIT_ACTIONS } from '../all-application-actions';
import { TApplicationType } from '@fan-id/shared/utils/form';

enum SearchType {
  Text = 1,
  Date = 2,
  Select = 3
}

export const oldCategories = [
  "MTH",
  "CG",
  "MIH",
  "IFESFS",
  "IFESRO",
  "MHO",
  "VMC",
  "LSC",
  "MVEH",
  "ACP",
  "APH",
  "VIP",
  "HWM",
  "NMTH",
  // 'NHWM'
] as const;

const advancedFilterDateFields = [
  "appdate",
  "applicationDateBegin",
  "applicationDateEnd"
] as const;

@Component({
  selector: 'fan-id-all-applications-list',
  templateUrl: './all-applications-list.component.html',
  styleUrls: ['./all-applications-list.component.scss'],
})
export class AllApplicationsListComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('toggleAdvFilter')
  toggleAdvFilter!: ElementRef;
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  columns: ListColumnName[];
  filteredAppdata: AllApplicationListData[];
  accommodationTypes$: Observable<{value: number, name: string}[]> = of([]);
  visaStatusList$: Observable<{value: number, name: string}[]> = of([]);
  conferenceList$: Observable<ActiveConferenceEvent[]> = of([]);
  searchSelectItems$: Observable<unknown[]> = of([]);
  selectedSearchColumnType = SearchType.Text;
  dtOptions: DataTables.Settings | undefined;
  dtTrigger: Subject<any> = new Subject<any>();

  emigrationStatusList = [
    {
      value: 1,
      name: 'Inside Qatar'
    },
    {
      value: 2,
      name: 'Outside Qatar'
    },
    {
      value: 3,
      name: 'No Data Available'
    }
  ]

  allApplication = new FormGroup({
    columnName: new FormControl(null, Validators.required),
    filterTxt: new FormControl(null, Validators.required),
    doctype: new FormControl(3),
    // advancedFilter controls
    tktrfcno: new FormControl(null),
    vochrcod: new FormControl(null),
    ordrid: new FormControl(null),
    regsc: new FormControl(null),
    fidno: new FormControl(null),
    appsno: new FormControl(null),
    docno: new FormControl(null),
    mobno: new FormControl(null),
    fname: new FormControl(null),
    lname: new FormControl(null),
    appstat: new FormControl(null),
    fidstat: new FormControl(null),
    nat: new FormControl(null),
    appdate: new FormControl(null),
    submitype: new FormControl(null),
    prefcolpoint: new FormControl(null),
    derrorcode: new FormControl(null),
    accommodationType: new FormControl(null),
    accommodationDate: new FormControl(null),
    organizationCategory: new FormControl(null),
    createdBy: new FormControl(null),
    hcc: new FormControl(null),
    emistat:new FormControl(null),
    purposeOfVisit: new FormControl(null),
    countryOfResidence: new FormControl(null),
    hayyaNo: new FormControl(null),
    visaStatus: new FormControl(null),
    refConferenceEvent_Id: new FormControl(null),
    regUserCategory_Name: new FormControl(null),
    applicationDateBegin: new FormControl(null),
    applicationDateEnd: new FormControl(null),
  });
  pageConfig: any = {
    id: 'AllApplicationsListPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  // filterIdsAvailable > 30
  filterColumnsSC = [
    {
      id: 14,
      name: "Ticket Application Number",
      value: 'ticketOrderId',
    },
    {
      id: 15,
      name: this.translate('TicketReferenceNumber'),
      value: 'ticketNo',
    },
    {
      id: 13,
      name: this.translate('VoucherCode'),
      value: 'voucherCode',
    },
    {
      id: 24,
      name: 'Match Hospitality',
      value: 'matchHospitalityOrder',
    },
    {
      id: 22,
      name: 'Data Error Code',
      value: 'moiErrorCode',
    },
    // {
    //   id: 19,
    //   name: this.translate('RegistrationServiceCenter'),
    //   value: 'RefRegServiceCenter_Code',
    // },
    {
      id: 21,
      name: 'Accommodation Type',
      value: 'accommodationType',
      type: SearchType.Select,
      list: this.metadataService.getAccommodationTypesWithPending()
    },
    {
      id: 10,
      name: this.translate('MobileNumber'),
      value: 'phone',
    },
    {
      id: 28,
      name: 'Purpose of Visit',
      value: 'purposeOfVisit_Name',
    },
    {
      id: 29,
      name: 'Country of Residence',
      value: 'currentResidentCountry_Name',
    },
    {
      id: 30,
      name: 'Entry Visa Status',
      value: 'visaStatus',
      type: SearchType.Select,
      list: this.metadataService.getVisaStatusList()
    },
  ];
  filterColumnsBR = [
    {
      id: 16,
      name: this.translate('UserCategory'),
      value: 'regUserCategory_Name',
    },
    {
      id: 17,
      name: this.translate('BulkGroupName'),
      value: 'bulkGroupName',
    },
    {
      id: 23,
      name: 'Organization Category',
      value: 'OrganizationCategoryName',
    },
    {
      id: 25,
      name: 'Created By',
      value: 'system_CreatedBy',
    },
    {
      id: 30,
      name: 'Conference',
      value: 'refConferenceEvent_Id',
      type: SearchType.Select,
      list: this.getConferenceList().pipe(map((list) => list.map((item) => ({ value: item.confrenceId, name: item.name_EN })))),
    },
  ];
  filterColumnsAgent = [
    {
      id: 20,
      name: 'Organization Name',
      value: 'organization_Name',
    },
  ];
  filterColumnsSearch: { id: number, name: string, value: string, type?: SearchType, list?: any }[] = [
    {
      id: 5,
      name: this.translate('FanIDNumber'),
      value:'hayyaNo'
    },
    {
      id: 4,
      name: this.translate('EntryRefNumber'),
      value: 'fanIdNo',
    },
    {
      id: 1,
      name: this.translate('ApplicationNumber'),
      value: 'applicationNo',
    },
    {
      id: 6,
      name: this.translate('DocumentNumber'),
      value: 'documentIdNo',
    },

    {
      id: 8,
      name: this.translate('FirstName'),
      value: 'firstName',
    },
    {
      id: 9,
      name: this.translate('LastName'),
      value: 'lastName',
    },
    {
      id: 2,
      name: this.translate('ApplicationStatus'),
      value: 'applicationStatus',
      type: SearchType.Select,
      list: this.metadataService.getApplicationStatuses()
    },
    {
      id: 3,
      name: this.translate('FanIDCardStatus'),
      value: 'cardStatus',
      type: SearchType.Select,
      list: this.metadataService.getHayyaCardStatuses()
    },
    // {
    //   id: 5,
    //   name: this.translate('DocumentType'),
    //   value: 'docType_Name',
    // },
    {
      id: 7,
      name: this.translate('Nationality'),
      value: 'nationality_Name',
    },
    {
      id: 11,
      name: this.translate('ApplicationDate'),
      value: 'applicationDate',
      type: SearchType.Date
    },
    {
      id: 12,
      name: this.translate('SubmissionType'),
      value: 'submissionType',
      type: SearchType.Select,
      list: this.metadataService.getSubmissionType()
    },
    // {
    //   id: 18,
    //   name: this.translate('PreferredCollectionPoint'),
    //   value: 'serivceCenterCode',
    // },
    {
      id: 18,
      name: 'Email ID',
      value: 'email',
    },
    {
      id: 27,
      name: 'Border Status',
      value:'border_Entry_Status',
      type: SearchType.Select,
      list: of(this.emigrationStatusList)
    },
    {
      id: 26,
      name: 'Hayya Visit Category',
      value: 'customerCategoryCode',
      type: SearchType.Select,
      list: this.getHayyaVisitCategoryList()
    },
  ];
  filter: any = {};
  all_applications_filter: {
    eventCode: string;
    serivceCenterCode?: string;
    organizationId?: string;
    inAnyApplicationStatus?: ApplicationStatus[];
    docTypeId: number;
  };
  all_applications_url: string;
  metadata$: Observable<MetadataResolve>;
  eventName: string;
  displayEventName;

  isServiceCenter = false;
  indexSaveBool = false;
  indexSave = 0;
  storedSelectColumn: number;
  storedFilterText: string | number;
  // displayStart:number = 3;
  show_export_modal = false;
  isUserAgent: boolean;
  serviceCentreList: Observable<MetaDataLookup[]>;
  DocTypeList: Observable<MetaDataLookup[]>;
  countries: Observable<NationalityLookup[]>;
  metaDataLookupParam: MetadataParams = {};
  submissionType: any;
  hayyaCardCategory = this.getHayyaVisitCategoryList();
  cardStatusList: FanIdCardStatusList[];
  applicationStatusList$: Observable<ApplicationStatusList[]>;
  advancedFilterBoolean = false;
  normalFilterBoolean = false;
  isRTLLayout: boolean;
  fanIdNumber: string = null;
  documentNumber: string = null;
  show_cancel_app_modal = false;
  cancel_application_error = false;
  cancel_application_success = false;
  cancelErrorMessage: string = null;
  delete_draft_data: any;
  show_delete_draft_modal = false;
  delete_draft_success = false;
  delete_draft_error = false;
  delete_draft_error_message: string;
  permission: any;
  allPermission: any;
  exportPermission:any;
  cancelPermission:any;
  dateToday!: NgbDateStruct;
  show_action_alert = false;
  action_alert_message: string;
  arrayOffilters=[];
  advFilterStored=[];
  updateMobileModalBoolean = false;
  updateMobileData:any;
  updateMobileSuccessBoolean = false;
  updateMobileFialedBoolean = false;
  updateMobileFailedMessage ='';
  updateProfileImageModalBoolean = false;
  updateProfileImageData:any;
  updateProfileImageSuccessBoolean = false;
  updateProfileImageFialedBoolean = false;
  updateProfileImageFailedMessage ='';
  updatePermission: any;
  showSyncAccommodationModal = false;
  syncAccomPermission: any;
  showUpdateFanCategoryModal = false;
  updateFanCategoryPermission: any;
  updateFanCategoryData:any;
  updateFanCategorySuccessBoolean = false;
  updateFanCategoryFailedBoolean = false;
  updateFanCategoryFailedMessage ='';
  showUpdateEmailModel: boolean;
  updateEmailData : any;
  updateFanEmailid: boolean;
  updateFanEmailidFailed: boolean;
  updateFanEmailIdFailedMessage: any;
  emailPermission: any;
  resendCompletionStatusError: string | boolean = false;
  resendCompletionStatusSuccess = false;
  resendCompletionStatusPermission: any;
  b2bPaymentPermission: any;

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(e) {
    if (window.scrollY > 5) {
      const element = document.getElementById('navbar');
      element.classList.add('sticky');
    } else {
      const element = document.getElementById('navbar');
      element.classList.remove('sticky');
    }
  }
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    private menuService: MenuService,
    public datepipe: DatePipe,
    private language: LanguageService,
    private metadataService: MetadataService,
    private aps: AllApplicationsService,
    private organizationService: OrganizationService,
  ) {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.isUserAgent = this.menuService.isUserTypeAgent;
    const all_applications_url_sc =
      this.config.apiUrl + '/api/CustomerCardApplication/get-List'; //irrespective of SC
    const all_applications_url_br =
      this.config.apiUrl +
      '/api/CustomerCardApplication/get-List-By-Organization-Id';
    this.all_applications_url = this.isServiceCenter
      ? all_applications_url_sc
      : all_applications_url_br;
    this.all_applications_filter = this.getAllApplicationsFilter();
    if (this.isServiceCenter) {
      // this.all_applications_filter.serivceCenterCode = this.menuService.getTerminalCode()
      this.filterColumnsSearch = [
        ...this.filterColumnsSC,
        ...this.filterColumnsSearch,
      ];
    } else {
      this.filterColumnsSearch = [
        ...(this.isUserAgent ? this.filterColumnsAgent : []),
        ...this.filterColumnsBR,
        ...this.filterColumnsSearch,
      ];
    }

    const today = new Date();
    this.dateToday = {
			year: today.getFullYear(),
			month: today.getMonth()+1,
			day: today.getDate(),
		};
  }

  ngOnInit(): void {
    this.getPermission();
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.language.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });

    const paging = this.normalFilterBoolean || this.advancedFilterBoolean;
    this.dtOptions = {
      paging,
      stateSave: true,
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      ordering: false,
      processing: true,
      info: false,
      lengthChange: false,
      //************** */
      serverSide: true,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
      ajax: (dataTablesParameters: any, callback) => {
        if (this.indexSaveBool === true) {
          dataTablesParameters.start = this.indexSave;
        }
        this.indexSave = dataTablesParameters.start;
        this.http
          .post<any>(this.all_applications_url, {
            ...this.filter,
            pageIndex: dataTablesParameters.start / dataTablesParameters.length,
          })
          .pipe(
            catchError(() => {
              return of({
                dataList: [],
                totalCount: 0,
              });
            })
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
        this.indexSaveBool = false;
      },
      columns: [
        {},
        {
          data: 'applicationDate',
        },
        {
          data: 'applicationNo',
        },
        {
          data: 'applicationStatus_Name',
        },
        {
          data: 'fanIdNo',
        },
        {
          data: 'cardStatus_Name',
        },
        ...(this.isServiceCenter
          ? []
          : [
              {
                data: 'regUserCategory_Name',
              },
            ]),
        {
          data: 'firstName',
        },
        {
          data: 'lastName',
        },
        ...(!this.isServiceCenter
          ? []
          : [
              {
                data: 'phoneAreaCode',
              },
              {
                data: 'phone',
              },
            ]),

        {
          data: 'docType_Name',
        },
        {
          data: 'documentIdNo',
        },
        ...(this.isServiceCenter
          ? []
          : [
              {
                data: 'bulkGroupName',
              },
              {
                data: 'organization_Name',
              },
            ]),
        ...(!this.isServiceCenter
          ? []
          : [
              {
                data: 'ticketOrderId',
              },
              {
                data: 'ticketNo',
              },
              {
                data: 'voucherCode',
              },
              {
                data: 'matchHospitality'
              }
            ]),
        {
          data: 'submissionType_Name',
        },
        ...(!this.isServiceCenter
          ? []
          : [
            {
              data: 'customerCategory_Name',
            },
              {
                data: 'dependentCount',
              },
            ]),
        // {
        //   data: 'serivceCenterCode',
        // },
        // ...(!this.isServiceCenter
        //   ? []
        //   : [
        //       {
        //         data: 'registrationServiceCenterCode',
        //       },
        //     ]),
        {
          data: 'nationality_Name',
        },
        { data: 'email'},
        ...(this.isServiceCenter ? [
          { data: 'moiErrorCode' },
          { data: 'accommodationTypeName' },
          { data: 'accommodationVerificationDate' }
        ] : [
          { data: 'system_CreatedBy' },
        ]),
      ],
      //**************** */
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };
  }

  get adf() {
    return this.allApplication.controls;
  }

  getPermission() {
    const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
    this.permission = permissionList?.roles?.find(
      (element) => element?.key === 'Customer Application'
    );
    this.exportPermission = permissionList?.roles?.find(
      (element) => element?.key === 'Export Applications'
    );
    this.cancelPermission = permissionList?.roles?.find(
      (element) => element?.key === 'Cancel Application'
    );
    this.updatePermission = permissionList?.roles?.find(
      (element) => element?.key === 'Update Application Profile Picture'
    );
    this.syncAccomPermission = permissionList?.roles?.find(
      (element) => element?.key === 'ReVerify Accommodation Verification'
    );
    this.emailPermission = permissionList?.roles?.find(
      (element) => element?.key === 'Update Email Address'
    );
    this.resendCompletionStatusPermission = permissionList?.roles?.find(
      (element) => element?.key === 'Update Completion Status to MOI'
    );
    this.b2bPaymentPermission = permissionList?.roles?.find(
      (element) => element?.key === 'B2B Payments'
    )
    this.allPermission = permissionList?.fullAccess;
    console.log('Permission List ', this.permission, this.allPermission);
  }

  getAllApplicationsFilter() {
    return {
      eventCode: this.menuService.getSelectedEventCode(),
      docTypeId: this.allApplication.controls.doctype.value,
      ...(this.isServiceCenter ? {
        includeSaved: false
      } : { includeDraft: true })
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  translate(key: string) {
    const translateKey = 'AllApplicantsList';
    return this.translateService.instant(translateKey + '.' + key);
  }

  spacetext() {
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && !this.allApplication.get('filterTxt')?.value.replace(/\s/g, '').length
    ) {
      result = true;
    }
    return result;
  }

  textTypeLength(){
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && this.allApplication.get('filterTxt')?.value.length<3
    ) {
      result = true;
    }
    return result;
  }

  searchdisable(){
    let result = true;
    if (
      this.allApplication.value.columnName != null &&
      this.allApplication.value.filterTxt != null
    ) {
      result = false;
    }
    return result;
  }

  getSelectedSearchColumn() {
    const value = this.allApplication?.get('columnName')?.value;
    return this.filterColumnsSearch.find((element) => element?.id === value)
  }

  getSelectedSearchColumnType() {
    return this.getSelectedSearchColumn()?.type ?? SearchType.Text;
  }

  checkAction(type: string, data: any) {
    const {
      applicationStatus: _as,
      cardStatus: _cs,
      printingStatus: _ps,
      isChildApplication: _ca, // boolean
      customerCategoryCode,
      docTypeId: _dt,
      border_Entry_Status: _bes,
      applicationDate :_ad,
      isApprovedOnece :_isAp
    } = data;
    const eventTournamentType = parseInt(
      localStorage.getItem('eventType')
    ) as TournamentType;
    const isCustomerVIP = FANID_CATEGORY_VIP.includes(customerCategoryCode);
    const loggedInUserHasVIPPrivilege = USERS_WITH_VIP_PRIVILEGE.includes(
      localStorage.getItem('userName')
    );

    switch (type) {
      case 'Lost/Stolen':
        return (_as === 2 || _as === 7) && _cs === 5;
      case 'Card Malfunctioning':
        return(_as === 2 || _as === 7) && _cs === 5;
      case 'Re-Submit':
        return false;
      case 'Update Info':
        return (
          _dt !== 1 &&
          [2, 3, 4, 7, 10].includes(_as) &&
          !(_cs === 1 && _ps === 2) &&
          (_bes !== '1' ||  !this.isServiceCenter) &&
          !([3, 4].includes(_as) && !_isAp && this.getApplicationType(customerCategoryCode)=='FWC')
        );
      case 'Add Dependent':
        return (
          !_ca && eventTournamentType !== 1 && _as !== 0
        );
      case 'Cancel':
        // return this.isServiceCenter && [2,3,7,10].includes(_as) && _bes !== '1';
        return this.isServiceCenter && ![
          ApplicationStatus.Cancelled,
          ApplicationStatus.CancellationInProgress
        ].includes(_as);
      case 'Re-Apply':
        return (false);
      case 'Edit':
        return false;
      case 'Delete':
        return false;
      case 'UpdateContact':
        return this.isServiceCenter && _bes !== '1' && !(_dt === 1 && _ca) && !([
          ApplicationStatus.Cancelled,
          ApplicationStatus.Pending,
          ApplicationStatus.DataError,
          ApplicationStatus.Pending_Verification,
          ApplicationStatus.RequestForCorrection
        ].includes(_as));
      case 'UpdateProfileImage':
        return this.isServiceCenter && _bes !== '1' && ([
          ApplicationStatus.Approved,
          ApplicationStatus.DataError,
          ApplicationStatus.Rejected,
          ApplicationStatus.Pending_Accommodation_Confirmation,
          ApplicationStatus.Pending_Payment
        ].includes(_as));
      case 'Sync Accommodation':
        return _as === ApplicationStatus.Pending_Accommodation_Confirmation;
      case 'Update Fan Category':
        return false;
      case 'Update Email':
         return (
          this.isServiceCenter &&
          ![1,6,5].includes(_as)
        );
      case 'Payment':
        return _as === ApplicationStatus.Pending_Payment;
      case 'Resend Completion Status':
        return this.isServiceCenter && [
          ApplicationStatus.Pending_Entry_Visa,
          ApplicationStatus.Approved
        ].includes(_as)
      default:
        return false;
    }
  }

  getApplicationType(category: string): TApplicationType | null {
    if (!category) return null;
    if ((oldCategories as unknown as string[]).includes(category)) return 'FWC';
    return 'VISA';
  }

  async action(action, data) {
    const { fanIdNo: fanid, applicationStatus, id, organization_Name } = data;
    if (action) {
      const edit_action = EDIT_ACTIONS.find((a) => a.name === action);
      if (edit_action) {
        const { errorMessage } = edit_action.validate?.(data) ?? {};
        if (errorMessage) {
          this.showActionValidationAlert(errorMessage);
          return;
        }
        if (edit_action.name === 'Update Info') {
          const { isEligible, errorMessage: _updateError } = await this.aps.checkUpdateEligibility({ fanIdNo: fanid })
            .pipe(map(response => {
              if (response?.data?.returnVal) return { isEligible: true,  errorMessage: '' };
              return { isEligible: false, errorMessage: response?.message || 'Something went wrong!' };
            }),
            catchError(error => {
              console.log({error});
              return of({ isEligible: false, errorMessage: error?.error?.message ?? 'Something went wrong!' });
            })
            ).toPromise();

          if (!isEligible) {
            this.showActionValidationAlert(_updateError);
            return;
          }
        }
        const { submitReasonType } = edit_action;
        this.router.navigate(
          ['main/all-applications/list/applicant-details/edit'],
          {
            queryParams: { submitReasonType, fanid },
          }
        );
      } else if (action === 'Add Dependent') {
        if(this.isServiceCenter) {
          this.router.navigate(['main/new-customer'], {
            queryParams: { parentfanid: fanid },
          });
        } else {
          this.router.navigate(['main/bulk-registration/manual-registration/new-application'], {
            queryParams: { parentfanid: fanid },
          });
        }
      } else {
        this.router.navigate(['main/all-applications/list/applicant-details'], {
          queryParams: { action, fanid },
        });
      }
    } else {
      if (applicationStatus === ApplicationStatus.Draft) {
        this.router.navigate(['/main/bulk-groups/bulk-group-application-details'], {
          queryParams: { id, from: organization_Name },
        });
      } else {
        this.router.navigate(['main/all-applications/list/applicant-details'], {
          queryParams: { action, fanid },
        });
      }
    }
  }

  showActionValidationAlert(message: string) {
    this.show_action_alert = true;
    this.action_alert_message = message;
  }

  closeActionValidationAlert() {
    this.show_action_alert = false;
    this.action_alert_message = '';
  }

  clearButton() {
    let result = false;
    if (
      this.allApplication.value.columnName != null ||
      this.allApplication.value.filterTxt != null
    ) {
      result = true;
    }
    return result;
  }

  async getApplicationsList() {
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    if (this.indexSaveBool) {
      (await this.dtElement.dtInstance).ajax.reload(null, false);
    } else {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }
  }

  dateFM(date) {
    const formattedInitDate = moment(date + 'Z');
    const finalDate = formattedInitDate.toLocaleString();
    return new DatePipe('en-Us').transform(finalDate, 'dd-MM-yyyy hh:mm:ss a');
  }

  showExportModal() {
    this.show_export_modal = true;
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  getConferenceList() {
    return this.organizationService.getActiveConferenceEventList().pipe(
      catchError((error) => { return of({} as ActiveConferenceEventListResponse) }),
      map((response) => response?.data?.conferenceEventLists ?? [])
    )
  }

  getHayyaVisitCategoryList() {
    if (!this.isServiceCenter) {
      return this.metadataService.getMetaDataCustomerCategory({}).pipe(
        map((response) => {
          return response?.map((item) => {
            return {
              value: item?.code,
              name: item?.name,
            };
          });
        })
      )
    }
    return this.metadataService.getHayyaCardCategory();
  }

  filterColumn() {
    this.normalFilterBoolean = true;
    localStorage.removeItem(
      'DataTables_importdatatable_/main/all-applications/list'
    );
    const docType = this.allApplication.get('doctype')?.value;
    sessionStorage.setItem('allAppsDocType', docType);
    if (
      this.allApplication.value.columnName != null ||
      this.allApplication.value.filterTxt != null
    ) {
      sessionStorage.setItem(
        'allAppsColumnName',
        this.allApplication.get('columnName')?.value
      );
      sessionStorage.setItem(
        'allAppsFilterTxt',
        JSON.stringify(this.allApplication.get('filterTxt')?.value)
      );
    } else {
      sessionStorage.removeItem('allAppsColumnName');
      sessionStorage.removeItem('allAppsFilterTxt');
    }
    let filterValue: any;
    this.all_applications_filter = this.getAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    const currentFilter = this.filter.filter ?? {};
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.allApplication.get('columnName')?.value) {
        if(this.selectedSearchColumnType === SearchType.Text) {
          filterValue = this.allApplication.get('filterTxt')?.value?.trim();
        }
        else if(filcol.type === SearchType.Date) {
          const formattedInitDate = this.allApplication.value.filterTxt;
          const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
          filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
        }
        else if(filcol.type === SearchType.Select) {
          filterValue = this.allApplication.get('filterTxt')?.value;
        }


        if(filcol.value === 'accommodationType') {
            this.filter.filter = { ...currentFilter };
            this.setAccommodationTypeFilter(filterValue);
        } else {
          this.filter.filter =
          (this.selectedSearchColumnType === SearchType.Text)
            ? { ...currentFilter, [filcol.value]: '#' + filterValue + '#' }
            : { ...currentFilter, [filcol.value]: filterValue };
        }
      }
    }
    if (this.allApplication.valid) {
      this.setPaging(true);
      this.getApplicationsList();
    }
  }

  onDocTypeChange() {
    const docType = this.allApplication.get('doctype')?.value;
    sessionStorage.setItem('allAppsDocType', docType);
    const columnName = this.allApplication.get('columnName')?.value;
    if (columnName === 27 && docType === 1) {
      this.clearFilter();
      return;
    }
    this.filter.filter = {
      ...this.filter.filter,
      ...this.getAllApplicationsFilter()
    }
    this.getApplicationsList();
  }

  advancedSearch() {
    sessionStorage.removeItem('advFilters');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_importdatatable_/main/all-applications/list'
    );
    this.advancedFilterBoolean = true;
    this.allApplication.get('filterTxt').reset();
    this.allApplication.get('columnName').reset();
    this.filter = {};
    this.all_applications_filter = this.getAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    this.setAdvancedSearchFilters();
    this.setPaging(true);
    this.getApplicationsList();
  }

  setAdvancedSearchFilters() {
    this.setAdvancedSearchFiltersText();
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('regsc').value)) {
      this.filter.filter[
        'registrationServiceCenterCode'
      ] = this.allApplication?.get('regsc')?.value;
    }
    if (!this.aps.isNull(this.allApplication?.get('appstat').value)) {
      this.filter.filter['applicationStatus'] = this.allApplication?.get(
        'appstat'
      )?.value;
      this.arrayOffilters.push({col:'applicationStatus', value:this.allApplication?.get('appstat')?.value, controlname:'appstat', hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('fidstat').value)) {
      this.filter.filter['cardStatus'] = this.allApplication?.get(
        'fidstat'
      )?.value;
      this.arrayOffilters.push({col:'cardStatus', value:this.allApplication?.get('fidstat')?.value, controlname:'fidstat' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('emistat').value)) {
      this.filter.filter['border_Entry_Status'] = this.allApplication?.get(
        'emistat'
      )?.value;
      this.arrayOffilters.push({col:'border_Entry_Status', value:this.allApplication?.get('emistat')?.value, controlname:'emistat' ,hashed:false})
    }
    // if (!this.aps.isNullOrEmpty(this.allApplication?.get('doctype').value)) {
    //   this.filter.filter['docTypeId'] = this.allApplication?.get(
    //     'doctype'
    //   )?.value;
    //   this.arrayOffilters.push({col:'docTypeId', value:this.allApplication?.get('doctype')?.value, controlname:'doctype' ,hashed:false})
    // }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('nat').value)) {
      this.filter.filter['nationalityCode'] = this.allApplication?.get(
        'nat'
      )?.value;
      this.arrayOffilters.push({col:'nationalityCode', value:this.allApplication?.get('nat')?.value, controlname:'nat' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('appdate').value)) {
      this.filter.filter['applicationDate'] = convertNgbDateToDDMMYYYY(
        this.allApplication?.get('appdate')?.value
      );
      this.arrayOffilters.push({col:'applicationDate', value:convertNgbDateToDDMMYYYY(this.allApplication?.get('appdate')?.value), controlname:'appdate' ,hashed:false})
    }
    const applicationDateBegin = this.allApplication?.get('applicationDateBegin')?.value;
    const applicationDateEnd = this.allApplication?.get('applicationDateEnd')?.value;
    if (!this.aps.isNullOrEmpty(applicationDateBegin)) {
      const filterValue = convertNgbDateToDDMMYYYY(applicationDateBegin);
      this.filter.filter['applicationDateBegin'] = filterValue;
      this.arrayOffilters.push({col:'applicationDateBegin', value: filterValue, controlname:'applicationDateBegin' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(applicationDateEnd)) {
      const filterValue = convertNgbDateToDDMMYYYY(applicationDateEnd);
      this.filter.filter['applicationDateEnd'] = filterValue;
      this.arrayOffilters.push({col:'applicationDateEnd', value: filterValue, controlname:'applicationDateEnd' ,hashed:false})
    }

    if (!this.aps.isNullOrEmpty(this.allApplication?.get('submitype').value)) {
      this.filter.filter['submissionType'] = this.allApplication?.get(
        'submitype'
      )?.value;
    }
    if (
      !this.aps.isNullOrEmpty(this.allApplication?.get('prefcolpoint').value)
    ) {
      this.filter.filter['serivceCenterCode'] = this.allApplication?.get(
        'prefcolpoint'
      )?.value;
    }

    if (
      !this.aps.isNull(this.allApplication?.get('accommodationType').value)
    ) {
      this.arrayOffilters.push({col:'accommodationType', value:this.allApplication?.get('accommodationType')?.value, controlname:'accommodationType' ,hashed:false})
   }

   if (!this.aps.isNullOrEmpty(this.allApplication?.get('hcc').value)) {
    this.filter.filter['customerCategoryCode'] = this.allApplication?.get(
      'hcc'
    )?.value;
    this.arrayOffilters.push({col:'customerCategoryCode', value:this.allApplication?.get('hcc')?.value, controlname:'hcc' ,hashed:false})
  }

  if (!this.aps.isNullOrEmpty(this.allApplication?.get('countryOfResidence').value)) {
    this.filter.filter['currentResidentCountryCode'] = this.allApplication?.get(
      'countryOfResidence'
    )?.value;
    this.arrayOffilters.push({col:'currentResidentCountryCode', value:this.allApplication?.get('countryOfResidence')?.value, controlname:'countryOfResidence' ,hashed:false})
  }

  if (!this.aps.isNullOrEmpty(this.allApplication?.get('visaStatus').value)) {
    this.filter.filter['visaStatus'] = this.allApplication?.get(
      'visaStatus'
    )?.value;
    this.arrayOffilters.push({col:'visaStatus', value:this.allApplication?.get('visaStatus')?.value, controlname:'visaStatus' ,hashed:false})
  }
  if (!this.aps.isNullOrEmpty(this.allApplication?.get('refConferenceEvent_Id').value)) {
    this.filter.filter['refConferenceEvent_Id'] = this.allApplication?.get(
      'refConferenceEvent_Id'
    )?.value;
    this.arrayOffilters.push({col:'refConferenceEvent_Id', value:this.allApplication?.get('refConferenceEvent_Id')?.value, controlname:'refConferenceEvent_Id' ,hashed:false})
  }

  sessionStorage.setItem("advFilters", JSON.stringify(this.arrayOffilters));
    this.setAccommodationFilter();
  }

  setAdvancedSearchFiltersText() {
    // text based filters i.e. #{value}#
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('tktrfcno').value)) {
      this.filter.filter['ticketNo'] =
        '#' + this.allApplication?.get('tktrfcno')?.value + '#';
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('vochrcod').value)) {
      this.filter.filter['voucherCode'] =
        '#' + this.allApplication?.get('vochrcod')?.value + '#';
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('ordrid').value)) {
      this.filter.filter['ticketOrderId'] =
        '#' + this.allApplication?.get('ordrid')?.value + '#';
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('fidno').value)) {
      this.filter.filter['fanIdNo'] =
        '#' + this.allApplication?.get('fidno')?.value + '#';
         this.arrayOffilters.push({col:'fanIdNo', value:this.allApplication?.get('fidno')?.value, controlname:'fidno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('hayyaNo').value)) {
      this.filter.filter['hayyaNo'] =
        '#' + this.allApplication?.get('hayyaNo')?.value + '#';
         this.arrayOffilters.push({col:'hayyaNo', value:this.allApplication?.get('hayyaNo')?.value, controlname:'hayyaNo' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('appsno').value)) {
      this.filter.filter['applicationNo'] =
        '#' + this.allApplication?.get('appsno')?.value + '#';
        this.arrayOffilters.push({col:'applicationNo', value:this.allApplication?.get('appsno')?.value, controlname:'appsno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('docno').value)) {
      this.filter.filter['documentIdNo'] =
        '#' + this.allApplication?.get('docno')?.value + '#';
        this.arrayOffilters.push({col:'documentIdNo', value:this.allApplication?.get('docno')?.value, controlname:'docno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('mobno').value)) {
      this.filter.filter['phone'] =
        '#' + this.allApplication?.get('mobno')?.value + '#';
        this.arrayOffilters.push({col:'phone', value:this.allApplication?.get('mobno')?.value, controlname:'mobno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('fname').value)) {
      this.filter.filter['firstName'] =
        '#' + this.allApplication?.get('fname')?.value + '#';
        this.arrayOffilters.push({col:'firstName', value:this.allApplication?.get('fname')?.value, controlname:'fname' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('lname').value)) {
      this.filter.filter['lastName'] =
        '#' + this.allApplication?.get('lname')?.value + '#';
        this.arrayOffilters.push({col:'lastName', value:this.allApplication?.get('lname')?.value, controlname:'lname' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('derrorcode').value)) {
      this.filter.filter['moiErrorCode'] =
        '#' + this.allApplication?.get('derrorcode')?.value + '#';
        this.arrayOffilters.push({col:'moiErrorCode', value:this.allApplication?.get('derrorcode')?.value, controlname:'derrorcode' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('organizationCategory').value)) {
      this.filter.filter['OrganizationCategoryName'] =
        '#' + this.allApplication?.get('organizationCategory')?.value + '#';
        this.arrayOffilters.push({col:'OrganizationCategoryName', value:this.allApplication?.get('organizationCategory')?.value, controlname:'organizationCategory' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('createdBy').value)) {
      this.filter.filter['system_CreatedBy'] =
        '#' + this.allApplication?.get('createdBy')?.value + '#';
        this.arrayOffilters.push({col:'system_CreatedBy', value:this.allApplication?.get('createdBy')?.value, controlname:'createdBy' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('purposeOfVisit').value)) {
      this.filter.filter['purposeOfVisit_Name'] =
        '#' + this.allApplication?.get('purposeOfVisit')?.value + '#';
        this.arrayOffilters.push({col:'purposeOfVisit_Name', value:this.allApplication?.get('purposeOfVisit')?.value, controlname:'purposeOfVisit' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.allApplication?.get('regUserCategory_Name').value)) {
      this.filter.filter['regUserCategory_Name'] =
        '#' + this.allApplication?.get('regUserCategory_Name')?.value + '#';
        this.arrayOffilters.push({col:'regUserCategory_Name', value:this.allApplication?.get('regUserCategory_Name')?.value, controlname:'regUserCategory_Name' ,hashed:true})
    }
  }

  setAccommodationFilter() {
    const accommodationType = this.allApplication?.get('accommodationType')?.value;
    const accommodationDate = this.allApplication?.get('accommodationDate')?.value;
    this.setAccommodationTypeFilter(accommodationType);
    if(accommodationDate) {
      this.filter.filter['accommodationVerificationDate'] = convertNgbDateToDDMMYYYY(accommodationDate);
    }
  }

  setAccommodationTypeFilter(accommodationType: number) {
    if (accommodationType > 0) {
      this.filter.filter['accommodationType'] = accommodationType;

    } else if(accommodationType === -1) {
      this.filter.filter['IsAccommodationVerified'] = false;
    }
  }
  // on advanced search clear
  onClearFilter() {
    sessionStorage.removeItem('advFilters');
    this.arrayOffilters = [];
    const docType = this.allApplication.get('doctype')?.value;
    this.allApplication.reset();
    this.allApplication.get('doctype')?.setValue(docType);
    this.advancedFilterBoolean = false;
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.all_applications_filter = this.getAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    this.setPaging(false);
    this.getApplicationsList();
  }
  // on normal search clear and refresh
  clearFilter() {
    this.normalFilterBoolean = false;
    this.advancedFilterBoolean = false;
    this.indexSaveBool = false;
    sessionStorage.removeItem('allAppsColumnName');
    sessionStorage.removeItem('allAppsFilterTxt');
    sessionStorage.removeItem('advFilters');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_importdatatable_/main/all-applications/list'
    );
    const docType = this.allApplication.get('doctype')?.value;
    this.allApplication.reset();
    this.allApplication.get('doctype')?.setValue(docType);
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.all_applications_filter = this.getAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    this.setPaging(false);
    this.getApplicationsList();
  }

  cancelApplication(fanIDNo, documentIdNo) {
    this.fanIdNumber = fanIDNo;
    this.documentNumber = documentIdNo;
    this.show_cancel_app_modal = true;
  }

  Cancel() {
    this.show_cancel_app_modal = false;
    const body: CancelApplication = {
      fanIDNo: this.fanIdNumber,
      documentIdNo: this.documentNumber,
    };
    console.log(body);
    this.aps
      .cancelApplication(body)
      .pipe(take(1))
      .subscribe(
        () => {
          this.cancel_application_success = true;
        },
        (err) => {
          this.cancel_application_error = true;
          this.cancelErrorMessage = err?.error?.message ?? 'Error';
        }
      );
  }

  cancelApplicationSuccess() {
    this.cancel_application_success = false;
    this.indexSaveBool = true;
    this.getApplicationsList();
  }

  deleteDraftApplication(fanIDNo, documentIdNo) {
    this.fanIdNumber = fanIDNo;
    this.documentNumber = documentIdNo;
    this.show_delete_draft_modal = true;
  }

  // closeDeleteDraftModal(e: 'yes' | 'no') {
  //   this.show_delete_draft_modal = false;
  //   e === 'yes' && this.deleteDraft();
  // }

  deleteDraft() {
    this.show_delete_draft_modal = false;
    const body: CancelApplication = {
      fanIDNo: this.fanIdNumber,
      documentIdNo: this.documentNumber,
    };
    console.log(body);
    this.aps
      .deleteDraftApps(body)
      .pipe(take(1))
      .subscribe(
        () => {
          this.delete_draft_success = true;
        },
        (err) => {
          this.delete_draft_error = true;
          this.cancelErrorMessage = err?.error?.message ?? 'Error';
        }
      );
  }

  deleteDraftSuccess() {
    this.delete_draft_success = false;
    this.indexSaveBool = true;
    this.getApplicationsList();
  }

  changeColumn() {
    this.allApplication.get('filterTxt').patchValue(null);
    this.selectedSearchColumnType = this.getSelectedSearchColumnType()
    this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
  }

  updateMobileNumber(data:any){
    this.updateMobileData = data;
    this.updateMobileModalBoolean = true;
  }

  closeUpdateMobile(event){
    console.log(event)
    this.updateMobileModalBoolean = false;
    if(event != false){
      this.aps.updateMobile(event).subscribe(response=>{
        this.updateMobileSuccessBoolean = true;
        this.updateMobileFialedBoolean = false;
      },error=>{
        this.updateMobileFialedBoolean = true;
        this.updateMobileSuccessBoolean = false;
        this.updateMobileFailedMessage = error?.error?.message || 'Something went wrong!'
      })
    }
  }

  closeUpdateMobileSuccessFailModal(){
    this.updateMobileSuccessBoolean = false;
        this.updateMobileFialedBoolean = false;
        this.getApplicationsList();
  }

  updateProfileImage(data:any){
    this.updateProfileImageData = data;
    this.updateProfileImageModalBoolean = true;
  }

  closeUpdateProfileImage(event){
    this.updateProfileImageModalBoolean = false;
    if(event != false){
      this.aps.updateProfileImage(event).subscribe(response=>{
        this.updateProfileImageSuccessBoolean = true;
        this.updateProfileImageFialedBoolean = false;
      },error=>{
        this.updateProfileImageFialedBoolean = true;
        this.updateProfileImageSuccessBoolean = false;
        this.updateProfileImageFailedMessage = error?.error?.message || 'Something went wrong!'
      })
    }
  }

  closeUpdateProfileImageSuccessFailModal() {
    this.updateProfileImageSuccessBoolean = false;
    this.updateProfileImageFialedBoolean = false;
    this.getApplicationsList();
  }

  openSyncAccommodationModal(data:any) {
    this.fanIdNumber = data?.fanIdNo;
    this.showSyncAccommodationModal = true;
  }

  closeSyncAccommodationModal(event: 'yes' | 'no') {
    this.showSyncAccommodationModal = false;
    if (event === 'yes') {
      this.syncAccommodation();
    }
  }

  syncAccommodation() {
    this.aps.reverifyAccommodation(this.fanIdNumber).subscribe({
      next: () => {
        this.closeSyncAccommodationModal('no');
        this.getApplicationsList();
      },
      error: (err) => {
        console.log(err);
        alert('Something went wrong!');
      }
    })
  }

  setPaging(state: boolean) {
    this.dtOptions && (this.dtOptions.paging = state);
  }

  openUpdateFanCategoryModal(data:any) {
    this.updateFanCategoryData = data;
    this.showUpdateFanCategoryModal = true;
  }

  openUpdateEmailModel(data:any) {
    this.updateEmailData = data;
    this.showUpdateEmailModel = true;
  }

  closeUpdateFanCategoryModal(event) {
    this.showUpdateFanCategoryModal = false;
    this.aps.updateFanCategory(event).subscribe(response => {
      this.updateFanCategorySuccessBoolean = true;
      this.updateFanCategoryFailedBoolean = false;
    }, err => {
      this.updateFanCategoryFailedMessage = err.error.message;
      this.updateFanCategoryFailedBoolean = true;
      this.updateFanCategorySuccessBoolean = false;
    })
  }

  closeUpdateFanCategorySuccessFailModal() {
    this.updateFanCategorySuccessBoolean = false;
    this.updateFanCategoryFailedBoolean = false;
    this.updateFanEmailidFailed = false;
    this.updateFanEmailid = false;
    this.getApplicationsList();
  }

  closeUpdateEmailModel(event) {
    this.showUpdateEmailModel = false;
    this.aps.updateEmail(event).subscribe(response => {
      this.updateFanEmailid = true;
      this.updateFanEmailidFailed = false;
    }, err => {
      this.updateFanEmailIdFailedMessage = err.error.message;
      this.updateFanEmailidFailed = true;
      this.updateFanEmailid = false;
    })
  }

  getVisaFlag(obj: string) {
    if (obj != "" && obj != null) {
      const visaNum = Number(obj);
      if (visaNum == 1 || visaNum == 2)
        return 'Valid';
      else
        return 'Invalid'
    }
    return 'N/A';
  }

  proceedPayment(data) {
    this.router.navigate(['main', 'payments', 'create-order'], {
      queryParams: { fanid: data?.fanIdNo }
    });
  }

  resendCompletionStatus(data) {
    this.resendCompletionStatusError = false;
    this.resendCompletionStatusSuccess = false;
    const body = {
      fanIdNo: data?.fanIdNo,
      eventCode: this.menuService.getSelectedEventCode(),
    }
    this.aps.resendCompletionStatus(body).subscribe({
      next: () => {
        this.resendCompletionStatusSuccess = true;
      },
      error: (err) => {
        console.log(err);
        this.resendCompletionStatusError = err?.error?.message || 'Something went wrong!';
      }
    })
  }
}
