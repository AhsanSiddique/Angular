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
  AllApplicationListData,
  ApplicationStatusList,
  FanIdCardStatusList,
  ListColumnName,
  MetaDataLookup,
  MetadataParams,
  MetadataResolve,
  NationalityLookup,
  PrinterManagementService,
} from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import {
  Environment,
  FanIDConfig,
  LanguageService,
} from '@fan-id/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { catchError, take } from 'rxjs/operators';
import * as moment from 'moment';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

enum SearchType {
  Text = 1,
  Date = 2,
  Select = 3
}

@Component({
  selector: 'fan-id-printer-list',
  templateUrl: './printer-list.component.html',
  styleUrls: ['./printer-list.component.scss']
})
export class PrinterListComponent implements OnInit, AfterViewInit, OnDestroy {
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

  printerFilterForm = new FormGroup({
    columnName: new FormControl(null, Validators.required),
    filterTxt: new FormControl(null, Validators.required),
  });

  pageConfig: any = {
    id: 'VerifyApplicationsListPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  filter: any = {};
  printer_list_filter: any = {};
  filterColumnsSearch: { id: number, name: string, value: string, type?: SearchType, list?: any }[] = [
    {
      id: 4,
      name: 'Terminal Name',
      value: 'serviceCenter_Name',
    },
    {
      id: 6,
      name: 'Printer Name',
      value: 'printerName',
    },
    {
      id: 1,
      name: 'Mac Address',
      value: 'macAddress',
    },
    {
      id: 2,
      name: 'Printer Type',
      value: 'printerType',
      type: SearchType.Select,
      list: of([{ value: 0, name: 'Printer' }, { value: 1, name: 'Printer Pool' }]),
    }
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
  delete_data: any;
  show_delete_confirm_modal = false;
  delete_draft_success = false;
  delete_draft_error = false;
  delete_draft_error_message: string;
  permission: any;
  allPermission: any;
  exportPermission:any;
  dateToday!: NgbDateStruct;
  show_action_alert = false;
  action_alert_message: string;
  arrayOffilters=[];
  advFilterStored=[];
  updateMobileModalBoolean:boolean=false;
  updateMobileData:any;
  updateMobileSuccessBoolean = false;
  updateMobileFialedBoolean = false;
  updateMobileFailedMessage ='';
  show_common_error_modal = false;
  common_error_header = 'Error';
  common_error_message = '';
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private http: HttpClient,
    private translateService: TranslateService,
    public datepipe: DatePipe,
    private language: LanguageService,
    private printerService: PrinterManagementService
  ) {
    const today = new Date();
    this.dateToday = {
			year: today.getFullYear(),
			month: today.getMonth()+1,
			day: today.getDate(),
		};
   }

  ngOnInit(): void {
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.language.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
    this.filterLoadingInitial();
    this.dtOptions = {
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
          .post<any>(this.config.apiUrl + '/api/MACAddressToPrinterMap/getList', {
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
        { data: 'serivceCenter_Name' },
        { data: 'printerType_Name' },
        { data: 'printerName' },
        { data: 'macAddress' }
      ],
      //**************** */
      initComplete: function (settings, json) {
        $('#printlistdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };
    this.dtElement.dtInstance.then((dtInstance: any) => {
      // Destroy the table first
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  filterLoadingInitial() {
    if (sessionStorage.getItem('printerListColumnName')) {
      this.storedSelectColumn = parseInt(
        sessionStorage?.getItem('printerListColumnName')
      );
      this.printerFilterForm.get('columnName').setValue(this.storedSelectColumn);
    }
    const filterTxt = JSON.parse(sessionStorage?.getItem('printerListFilterTxt'));
    if (filterTxt) {
      this.storedFilterText = !isNaN(parseInt(filterTxt)) ? parseInt(filterTxt) : filterTxt;
      // this.allApplication.get('filterTxt').patchValue(this.storedFilterText);
    }
    this.columns = this.filterColumnsSearch;
    this.filter.filter = this.printer_list_filter;
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    //below reload current page and filters
    if (this.storedSelectColumn && (this.storedFilterText != null && this.storedFilterText !== '')) {
      this.normalFilterBoolean = true;
      let filterValue: unknown;
      for (const filcol of this.filterColumnsSearch) {
        const currentFilter = this.filter?.filter ?? {};
        if (filcol.id == this.printerFilterForm.get('columnName')?.value) {
          this.selectedSearchColumnType = filcol.type ?? SearchType.Text;
          if(this.selectedSearchColumnType === SearchType.Text) {
            const _filterTxt = this.storedFilterText;
            filterValue = _filterTxt.toString().trim();
            this.printerFilterForm.get('filterTxt').patchValue(filterValue);
          } else if(filcol.type === SearchType.Date) {
            const formattedInitDate = this.storedFilterText as unknown as NgbDateStruct;
            this.printerFilterForm.get('filterTxt')?.patchValue(formattedInitDate);
            const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
            filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
          } else if(this.selectedSearchColumnType === SearchType.Select) {
            this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
            filterValue = this.storedFilterText;
            this.printerFilterForm.get('filterTxt').patchValue(filterValue);
          }

          if(filcol.value === 'accommodationType') {
            this.filter.filter = { ...currentFilter };
            this.setAccommodationTypeFilter(filterValue as number)
          } else {
            this.filter.filter =
            (this.selectedSearchColumnType === SearchType.Text)
              ? { ...currentFilter, [filcol.value]: '#' + filterValue + '#' }
              : { ...currentFilter, [filcol.value]: filterValue };
          }
        }
      }
    }
    // else{
    //   if(sessionStorage.getItem("advFilters")){
    //     this.advFilterStored = JSON.parse(sessionStorage.getItem("advFilters"));
    //     if(this.advFilterStored){
    //       this.advancedFilterBoolean = true;
    //       this.advFilterStored.forEach(item=>{
    //         if(item.controlname === 'appdate'){
    //           let ddmmyytommddyy = convertDateDDMMYYYYToMMDDYYYY(item.value)
    //           this.allApplication.controls[item.controlname].patchValue(convertDateStringToNgbDate(ddmmyytommddyy));
    //         }
    //         else{
    //           this.allApplication.controls[item.controlname].patchValue(item.value);
    //         }
    //         if(item.hashed){
    //           this.filter.filter[item.col] =
    //             '#' + item.value + '#';
    //         }
    //         else{
    //           if(item.controlname === 'accommodationType'){
    //             this.setAccommodationTypeFilter(item.value)
    //           }
    //           else{
    //           this.filter.filter[item.col] = item.value;
    //         }
    //         }
    //       })
    //     }
    //   }
    // }
  }
  getSelectedSearchColumn() {
    const value = this.printerFilterForm?.get('columnName')?.value;
    return this.filterColumnsSearch.find((element) => element?.id === value)
  }
  setAccommodationTypeFilter(accommodationType: number) {
    if (accommodationType > 0) {
      this.filter.filter['accommodationType'] = accommodationType;

    } else if(accommodationType === -1) {
      this.filter.filter['IsAccommodationVerified'] = false;
    }
  }

  changeColumn() {
    this.printerFilterForm.get('filterTxt').patchValue(null);
    this.selectedSearchColumnType = this.getSelectedSearchColumnType()
    this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
  }
  getSelectedSearchColumnType() {
    return this.getSelectedSearchColumn()?.type ?? SearchType.Text;
  }

  clearButton() {
    let result = false;
    if (
      this.printerFilterForm.value.columnName != null ||
      (this.printerFilterForm.value.filterTxt != null  && this.printerFilterForm.value.filterTxt != '')
    ) {
      result = true;
    }
    return result;
  }

  clearFilter() {
    this.indexSaveBool = false;
    sessionStorage.removeItem('printerListColumnName');
    sessionStorage.removeItem('printerListFilterTxt');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_printlistdatatable_/main/printer-management/list'
    );
    this.printerFilterForm.reset();
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.printer_list_filter = this.setAllApplicationsFilter();
    this.filter.filter = this.printer_list_filter;
    this.getApplicationsList();
  }
  setAllApplicationsFilter() {
    return {
    };
  }
  public filterColumn() {
    this.normalFilterBoolean = true;
    localStorage.removeItem(
      'DataTables_printlistdatatable_/main/printer-management/list'
    );
    if (
      this.printerFilterForm.value.columnName != null ||
      this.printerFilterForm.value.filterTxt != null
    ) {
      sessionStorage.setItem(
        'printerListColumnName',
        this.printerFilterForm.get('columnName')?.value
      );
      sessionStorage.setItem(
        'printerListFilterTxt',
        JSON.stringify(this.printerFilterForm.get('filterTxt')?.value)
      );
    } else {
      sessionStorage.removeItem('printerListColumnName');
      sessionStorage.removeItem('printerListFilterTxt');
    }
    let filterValue: any;
    this.filter.filter = this.printer_list_filter;
    const currentFilter = this.filter.filter ?? {};
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.printerFilterForm.get('columnName')?.value) {
        if(this.selectedSearchColumnType === SearchType.Text) {
          filterValue = this.printerFilterForm.get('filterTxt')?.value?.trim();
        }
        else if(filcol.type === SearchType.Date) {
          const formattedInitDate = this.printerFilterForm.value.filterTxt;
          const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
          filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
        }
        else if(filcol.type === SearchType.Select) {
          filterValue = this.printerFilterForm.get('filterTxt')?.value;
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
    if (this.printerFilterForm.valid) {
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

  Update(data){
    this.router.navigate(['main/printer-management/create-or-update'], {
      queryParams: { id:data.id },
    });
  }
  create(){
    this.router.navigate(['main/printer-management/create-or-update']);
  }
  delete() {
    const { id, system_RowVersion } = this.delete_data;
    this.printerService.deleteConfiguration({id, system_RowVersion})
      .subscribe({
        next: response => {
          if (response?.status === 200) {
            this.getApplicationsList();
          } else {
            this.showCommonError({
              header: 'Error',
              message: response?.message ?? 'Something went wrong! Please try again'
            })
          }
        },
        error: err => {
          console.log(err);
          this.showCommonError({
            header: 'Error',
            message: 'Something went wrong! Please try again'
          })
        }
      })
  }

  closeDeleteConfirmation(e: 'yes' | 'no') {
    this.show_delete_confirm_modal = false;
    e === 'yes' && this.delete();
  }
  showDeleteConfirmation(data) {
    this.show_delete_confirm_modal = true;
    this.delete_data = data;
  }
  showCommonError({header, message}: {header: string, message?: string}) {
    this.show_common_error_modal = true;
    this.common_error_header = header;
    message && (this.common_error_message = message);
  }

  translate(key: string) {
    const translateKey = 'AllApplicantsList';
    return this.translateService.instant(translateKey + '.' + key);
  }
  spacetext() {
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && !this.printerFilterForm.get('filterTxt')?.value.replace(/\s/g, '').length
    ) {
      result = true;
    }
    return result;
  }

}
