import {
  AfterViewInit,
  Component,
  OnDestroy,
  Inject,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AllApplicationsService,
  ApplicationStatus,
  ApplicationStatusList,
  FanIdCardStatusList,
  ListColumnName,
  MetaDataLookup,
  MetadataParams,
  MetadataResolve,
  MetadataService,
  NationalityLookup,
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
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';
import {
  convertDateDDMMYYYYToMMDDYYYY,
  convertDateStringToNgbDate,
  convertNgbDateToDDMMYYYY,
} from '@fan-id/shared/utils/date';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

enum SearchType {
  Text = 1,
  Date = 2,
  Select = 3,
}

@Component({
  selector: 'fan-id-verify-application-list',
  templateUrl: './verify-application-list.component.html',
  styleUrls: ['./verify-application-list.component.scss'],
})
export class VerifyApplicationListComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('toggleAdvFilter')
  toggleAdvFilter!: ElementRef;
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  columns!: ListColumnName[];
  filteredAppdata!: any[];
  accommodationTypes$: Observable<{value: number, name: string}[]> = of([]);
  searchSelectItems$: Observable<unknown[]> = of([]);
  selectedSearchColumnType = SearchType.Text;
  dtOptions: DataTables.Settings | undefined;

  dtTrigger: Subject<any> = new Subject<any>();

  verifyApplicationForm = new FormGroup({
    columnName: new FormControl(null, Validators.required),
    filterTxt: new FormControl(null, Validators.required),
    fidno: new FormControl(null),
    appsno: new FormControl(null),
    docno: new FormControl(null),
    mobno: new FormControl(null),
    fname: new FormControl(null),
    lname: new FormControl(null),
    appstat: new FormControl(null),
    fidstat: new FormControl(null),
    doctype: new FormControl(null),
    nat: new FormControl(null),
    appdate: new FormControl(null),
    derrorcode: new FormControl(null),
    accommodationType: new FormControl(null),
  });

  pageConfig: any = {
    id: 'VerifyApplicationsListPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  filter: any = {};
  all_applications_filter: {
    eventCode: string;
    serivceCenterCode?: string;
    organizationId?: string;
    inAnyApplicationStatus?: ApplicationStatus[];
  };
  filterColumnsSearch: {
    id: number;
    name: string;
    value: string;
    type?: SearchType;
    list?: any;
  }[] = [
    {
      id: 4,
      name: this.translate('FanIDNumber'),
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
    // {
    //   id: 2,
    //   name: this.translate('ApplicationStatus'),
    //   value: 'applicationStatus_Name',
    // },
    {
      id: 3,
      name: this.translate('FanIDCardStatus'),
      value: 'cardStatus_Name',
    },

    {
      id: 5,
      name: this.translate('DocumentType'),
      value: 'docType_Name',
    },

    {
      id: 7,
      name: this.translate('Nationality'),
      value: 'nationality_Name',
    },
    {
      id: 11,
      name: this.translate('ApplicationDate'),
      value: 'applicationDate',
      type: SearchType.Date,
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
      id: 14,
      name: 'Ticket Application Number',
      value: 'ticketOrderId',
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
      list: this.metadataService.getAccommodationTypesWithPending(),
    },
    {
      id: 10,
      name: this.translate('MobileNumber'),
      value: 'phone',
    },
  ];
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
  cardStatusList: FanIdCardStatusList[];
  ApplicationStatusNameList: ApplicationStatusList[];
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
  exportPermission: any;
  dateToday!: NgbDateStruct;
  show_action_alert = false;
  action_alert_message: string;
  arrayOffilters = [];
  advFilterStored = [];
  updateMobileModalBoolean: boolean = false;
  updateMobileData: any;
  updateMobileSuccessBoolean = false;
  updateMobileFialedBoolean = false;
  updateMobileFailedMessage = '';
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    private menuService: MenuService,
    public datepipe: DatePipe,
    private language: LanguageService,
    private metadataService: MetadataService,
    private aps: AllApplicationsService
  ) {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.all_applications_filter = this.setAllApplicationsFilter();
    const today = new Date();
    this.dateToday = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate(),
    };
  }

  ngOnInit(): void {
    // this.getPermission();
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.language.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
    this.filterLoadingInitial();
    this.dtOptions = {
      // select:'multiple',
      // displayStart:this.displayStart,
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
          .post<any>(
            this.config.apiUrl +
              '/api/CustomerCardApplication/getApplicationVerificationList',
            {
              ...this.filter,
              pageIndex:
                dataTablesParameters.start / dataTablesParameters.length,
            }
          )
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
        {
          data: 'firstName',
        },
        {
          data: 'lastName',
        },
        {
          data: 'phoneAreaCode',
        },
        {
          data: 'phone',
        },
        {
          data: 'docType_Name',
        },
        {
          data: 'documentIdNo',
        },
        {
          data: 'ticketOrderId',
        },
        {
          data: 'matchHospitality',
        },
        {
          data: 'submissionType_Name',
        },
        {
          data: 'dependentCount',
        },
        {
          data: 'nationality_Name',
        },
        { data: 'email' },
        {
          data: 'moiErrorCode',
        },
        { data: 'accommodationTypeName' },
        { data: 'accommodationVerificationDate' },
      ],
      //**************** */
      initComplete: function (settings, json) {
        $('#verifyApplicationdatatable').wrap(
          "<div class='fan-id-tablewrap'></div>"
        );
      },
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  filterLoadingInitial() {
    if (sessionStorage.getItem('verifyAppsColumnName')) {
      this.storedSelectColumn = parseInt(
        sessionStorage?.getItem('verifyAppsColumnName')
      );
      this.verifyApplicationForm
        .get('columnName')
        .setValue(this.storedSelectColumn);
    }
    const filterTxt = JSON.parse(
      sessionStorage?.getItem('verifyAppsFilterTxt')
    );
    if (filterTxt) {
      this.storedFilterText = !isNaN(parseInt(filterTxt))
        ? parseInt(filterTxt)
        : filterTxt;
      // this.verifyApplicationForm.get('filterTxt').patchValue(this.storedFilterText);
    }
    this.columns = this.filterColumnsSearch;
    this.filter.filter = this.all_applications_filter;
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    //below reload current page and filters
    if (
      this.storedSelectColumn &&
      this.storedFilterText != null &&
      this.storedFilterText !== ''
    ) {
      this.normalFilterBoolean = true;
      let filterValue: unknown;
      for (const filcol of this.filterColumnsSearch) {
        const currentFilter = this.filter?.filter ?? {};
        if (filcol.id == this.verifyApplicationForm.get('columnName')?.value) {
          this.selectedSearchColumnType = filcol.type ?? SearchType.Text;
          if (this.selectedSearchColumnType === SearchType.Text) {
            const _filterTxt = this.storedFilterText;
            filterValue = _filterTxt.toString().trim();
            this.verifyApplicationForm.get('filterTxt').patchValue(filterValue);
          } else if (filcol.type === SearchType.Date) {
            const formattedInitDate = (this
              .storedFilterText as unknown) as NgbDateStruct;
            this.verifyApplicationForm
              .get('filterTxt')
              ?.patchValue(formattedInitDate);
            const dateis = new Date(
              formattedInitDate.year,
              formattedInitDate.month - 1,
              formattedInitDate.day
            );
            filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
          } else if (this.selectedSearchColumnType === SearchType.Select) {
            this.searchSelectItems$ =
              this.getSelectedSearchColumn()?.list ?? of([]);
            filterValue = this.storedFilterText;
            this.verifyApplicationForm.get('filterTxt').patchValue(filterValue);
          }

          if (filcol.value === 'accommodationType') {
            this.filter.filter = { ...currentFilter };
            this.setAccommodationTypeFilter(filterValue as number);
          } else {
            this.filter.filter =
              this.selectedSearchColumnType === SearchType.Text
                ? { ...currentFilter, [filcol.value]: '#' + filterValue + '#' }
                : { ...currentFilter, [filcol.value]: filterValue };
          }
        }
      }
    } else {
      if (sessionStorage.getItem('advVerifyAppFilters')) {
        this.advFilterStored = JSON.parse(
          sessionStorage.getItem('advVerifyAppFilters')
        );
        if (this.advFilterStored) {
          this.advancedFilterBoolean = true;
          this.advFilterStored.forEach((item) => {
            if (item.controlname === 'appdate') {
              let ddmmyytommddyy = convertDateDDMMYYYYToMMDDYYYY(item.value);
              this.verifyApplicationForm.controls[item.controlname].patchValue(
                convertDateStringToNgbDate(ddmmyytommddyy)
              );
            } else {
              this.verifyApplicationForm.controls[item.controlname].patchValue(
                item.value
              );
            }
            // console.log("fil... ",this.filter,item)

            if (item.hashed) {
              this.filter.filter[item.col] = '#' + item.value + '#';
            } else {
              if (item.controlname === 'accommodationType') {
                this.setAccommodationTypeFilter(item.value);
              } else {
                this.filter.filter[item.col] = item.value;
              }
            }
          });
        }
      }
    }
  }
  getSelectedSearchColumn() {
    const value = this.verifyApplicationForm?.get('columnName')?.value;
    return this.filterColumnsSearch.find((element) => element?.id === value);
  }
  setAccommodationTypeFilter(accommodationType: number) {
    if (accommodationType > 0) {
      this.filter.filter['accommodationType'] = accommodationType;
    } else if (accommodationType === -1) {
      this.filter.filter['IsAccommodationVerified'] = false;
    }
  }

  changeColumn() {
    this.verifyApplicationForm.get('filterTxt').patchValue(null);
    this.selectedSearchColumnType = this.getSelectedSearchColumnType();
    this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
  }
  getSelectedSearchColumnType() {
    return this.getSelectedSearchColumn()?.type ?? SearchType.Text;
  }

  clearButton() {
    let result = false;
    if (
      this.verifyApplicationForm.value.columnName != null ||
      (this.verifyApplicationForm.value.filterTxt != null &&
        this.verifyApplicationForm.value.filterTxt != '')
    ) {
      result = true;
    }
    return result;
  }

  clearFilter() {
    this.indexSaveBool = false;
    this.advancedFilterBoolean = false;
    this.normalFilterBoolean = false;
    sessionStorage.removeItem('verifyAppsColumnName');
    sessionStorage.removeItem('verifyAppsFilterTxt');
    sessionStorage.removeItem('advVerifyAppFilters');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_verifyApplicationdatatable_/main/verify-application'
    );
    this.verifyApplicationForm.reset();
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.all_applications_filter = this.setAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    this.getApplicationsList();
  }
  setAllApplicationsFilter() {
    return {
      eventCode: this.menuService.getSelectedEventCode(),
      ...(this.isServiceCenter && {
        includeSaved: false,
      }),
    };
  }
  public filterColumn() {
    this.normalFilterBoolean = true;
    localStorage.removeItem(
      'DataTables_verifyApplicationdatatable_/main/verify-application'
    );
    if (
      this.verifyApplicationForm.value.columnName != null ||
      this.verifyApplicationForm.value.filterTxt != null
    ) {
      sessionStorage.setItem(
        'verifyAppsColumnName',
        this.verifyApplicationForm.get('columnName')?.value
      );
      sessionStorage.setItem(
        'verifyAppsFilterTxt',
        JSON.stringify(this.verifyApplicationForm.get('filterTxt')?.value)
      );
    } else {
      sessionStorage.removeItem('verifyAppsColumnName');
      sessionStorage.removeItem('verifyAppsFilterTxt');
    }
    let filterValue: any;
    this.filter.filter = this.all_applications_filter;
    const currentFilter = this.filter.filter ?? {};
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.verifyApplicationForm.get('columnName')?.value) {
        if (this.selectedSearchColumnType === SearchType.Text) {
          filterValue = this.verifyApplicationForm
            .get('filterTxt')
            ?.value?.trim();
        } else if (filcol.type === SearchType.Date) {
          const formattedInitDate = this.verifyApplicationForm.value.filterTxt;
          const dateis = new Date(
            formattedInitDate.year,
            formattedInitDate.month - 1,
            formattedInitDate.day
          );
          filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
        } else if (filcol.type === SearchType.Select) {
          filterValue = this.verifyApplicationForm.get('filterTxt')?.value;
        }

        if (filcol.value === 'accommodationType') {
          this.filter.filter = { ...currentFilter };
          this.setAccommodationTypeFilter(filterValue);
        } else {
          this.filter.filter =
            this.selectedSearchColumnType === SearchType.Text
              ? { ...currentFilter, [filcol.value]: '#' + filterValue + '#' }
              : { ...currentFilter, [filcol.value]: filterValue };
        }
      }
    }
    if (this.verifyApplicationForm.valid) {
      this.getApplicationsList();
    }
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
  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  dateFM(date) {
    const formattedInitDate = moment(date + 'Z');
    const finalDate = formattedInitDate.toLocaleString();
    return new DatePipe('en-Us').transform(finalDate, 'dd-MM-yyyy hh:mm:ss a');
  }

  verifyApplication(data) {
    this.router.navigate(['main/verify-application/edit'], {
      queryParams: { submitReasonType: 8, fanid: data.fanIdNo },
    });
  }

  translate(key: string) {
    const translateKey = 'AllApplicantsList';
    return this.translateService.instant(translateKey + '.' + key);
  }
  spacetext() {
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text ||
        !this.selectedSearchColumnType) &&
      !this.verifyApplicationForm.get('filterTxt')?.value.replace(/\s/g, '')
        .length
    ) {
      result = true;
    }
    return result;
  }

  advancedSearch() {
    sessionStorage.removeItem('advVerifyAppFilters');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_verifyApplicationdatatable_/main/verify-application'
    );
    this.advancedFilterBoolean = true;
    this.verifyApplicationForm.get('filterTxt').reset();
    this.verifyApplicationForm.get('columnName').reset();
    this.filter = {};
    this.all_applications_filter = this.setAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    this.setAdvancedSearchFilters();
    this.getApplicationsList();
  }

  setAdvancedSearchFilters() {
    this.setAdvancedSearchFiltersText();
    if (!this.aps.isNull(this.verifyApplicationForm?.get('appstat').value)) {
      this.filter.filter['applicationStatus'] = this.verifyApplicationForm?.get(
        'appstat'
      )?.value;
      this.arrayOffilters.push({
        col: 'applicationStatus',
        value: this.verifyApplicationForm?.get('appstat')?.value,
        controlname: 'appstat',
        hashed: false,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('fidstat').value)
    ) {
      this.filter.filter['cardStatus'] = this.verifyApplicationForm?.get(
        'fidstat'
      )?.value;
      this.arrayOffilters.push({
        col: 'cardStatus',
        value: this.verifyApplicationForm?.get('fidstat')?.value,
        controlname: 'fidstat',
        hashed: false,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('doctype').value)
    ) {
      this.filter.filter['docTypeId'] = this.verifyApplicationForm?.get(
        'doctype'
      )?.value;
      this.arrayOffilters.push({
        col: 'docTypeId',
        value: this.verifyApplicationForm?.get('doctype')?.value,
        controlname: 'doctype',
        hashed: false,
      });
    }
    if (!this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('nat').value)) {
      this.filter.filter['nationalityCode'] = this.verifyApplicationForm?.get(
        'nat'
      )?.value;
      this.arrayOffilters.push({
        col: 'nationalityCode',
        value: this.verifyApplicationForm?.get('nat')?.value,
        controlname: 'nat',
        hashed: false,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('appdate').value)
    ) {
      this.filter.filter['applicationDate'] = convertNgbDateToDDMMYYYY(
        this.verifyApplicationForm?.get('appdate')?.value
      );
      this.arrayOffilters.push({
        col: 'applicationDate',
        value: convertNgbDateToDDMMYYYY(
          this.verifyApplicationForm?.get('appdate')?.value
        ),
        controlname: 'appdate',
        hashed: false,
      });
    }

    if (
      !this.aps.isNull(
        this.verifyApplicationForm?.get('accommodationType').value
      )
    ) {
      this.arrayOffilters.push({
        col: 'accommodationType',
        value: this.verifyApplicationForm?.get('accommodationType')?.value,
        controlname: 'accommodationType',
        hashed: false,
      });
    }

    sessionStorage.setItem(
      'advVerifyAppFilters',
      JSON.stringify(this.arrayOffilters)
    );
    this.setAccommodationFilter();
  }

  setAdvancedSearchFiltersText() {
    // text based filters i.e. #{value}#
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('fidno').value)
    ) {
      this.filter.filter['fanIdNo'] =
        '#' + this.verifyApplicationForm?.get('fidno')?.value + '#';
      this.arrayOffilters.push({
        col: 'fanIdNo',
        value: this.verifyApplicationForm?.get('fidno')?.value,
        controlname: 'fidno',
        hashed: true,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('appsno').value)
    ) {
      this.filter.filter['applicationNo'] =
        '#' + this.verifyApplicationForm?.get('appsno')?.value + '#';
      this.arrayOffilters.push({
        col: 'applicationNo',
        value: this.verifyApplicationForm?.get('appsno')?.value,
        controlname: 'appsno',
        hashed: true,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('docno').value)
    ) {
      this.filter.filter['documentIdNo'] =
        '#' + this.verifyApplicationForm?.get('docno')?.value + '#';
      this.arrayOffilters.push({
        col: 'documentIdNo',
        value: this.verifyApplicationForm?.get('docno')?.value,
        controlname: 'docno',
        hashed: true,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('mobno').value)
    ) {
      this.filter.filter['phone'] =
        '#' + this.verifyApplicationForm?.get('mobno')?.value + '#';
      this.arrayOffilters.push({
        col: 'phone',
        value: this.verifyApplicationForm?.get('mobno')?.value,
        controlname: 'mobno',
        hashed: true,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('fname').value)
    ) {
      this.filter.filter['firstName'] =
        '#' + this.verifyApplicationForm?.get('fname')?.value + '#';
      this.arrayOffilters.push({
        col: 'firstName',
        value: this.verifyApplicationForm?.get('fname')?.value,
        controlname: 'fname',
        hashed: true,
      });
    }
    if (
      !this.aps.isNullOrEmpty(this.verifyApplicationForm?.get('lname').value)
    ) {
      this.filter.filter['lastName'] =
        '#' + this.verifyApplicationForm?.get('lname')?.value + '#';
      this.arrayOffilters.push({
        col: 'lastName',
        value: this.verifyApplicationForm?.get('lname')?.value,
        controlname: 'lname',
        hashed: true,
      });
    }
    if (
      !this.aps.isNullOrEmpty(
        this.verifyApplicationForm?.get('derrorcode').value
      )
    ) {
      this.filter.filter['moiErrorCode'] =
        '#' + this.verifyApplicationForm?.get('derrorcode')?.value + '#';
      this.arrayOffilters.push({
        col: 'moiErrorCode',
        value: this.verifyApplicationForm?.get('derrorcode')?.value,
        controlname: 'derrorcode',
        hashed: true,
      });
    }
  }

  setAccommodationFilter() {
    const accommodationType = this.verifyApplicationForm?.get(
      'accommodationType'
    )?.value;
    const accommodationDate = this.verifyApplicationForm?.get(
      'accommodationDate'
    )?.value;
    this.setAccommodationTypeFilter(accommodationType);
    if (accommodationDate) {
      this.filter.filter[
        'accommodationVerificationDate'
      ] = convertNgbDateToDDMMYYYY(accommodationDate);
    }
  }

  onClearFilter() {
    sessionStorage.removeItem('advVerifyAppFilters');
    this.arrayOffilters = [];
    this.verifyApplicationForm.reset();
    this.advancedFilterBoolean = false;
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.all_applications_filter = this.setAllApplicationsFilter();
    this.filter.filter = this.all_applications_filter;
    this.getApplicationsList();
  }

  getPermission() {
    if (this.isServiceCenter) {
      const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
      this.permission = permissionList?.roles?.find(
        (element) => element?.key === 'Customer Application'
      );
      this.exportPermission = permissionList?.roles?.find(
        (element) => element?.key === 'Export Applications'
      );

      this.allPermission = permissionList?.fullAccess;
      console.log('Permission List ', this.permission, this.allPermission);
    } else {
      this.allPermission = true;
    }
  }
}
