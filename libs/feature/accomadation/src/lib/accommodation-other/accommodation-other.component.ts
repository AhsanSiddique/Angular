import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { IAccommodationOtherGetListRequest, IAccommodationOtherGetListRequestFilter, IAccommodationOtherGetListItem, ApplicantService } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { DataTableDirective } from 'angular-datatables';
import { of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AccommodationTableBase } from '../accommodation-table.base';
import { EFilterState } from '../accommodation.common';
import { dataColumns as AccommodationOtherDataColumns } from './other.columns';

const SessionStorageKeys = {
  FILTER_STATE: 'acc_other_filter_state',
  FILTER_COLUMN: 'acc_other_filter_column',
  FILTER_VALUE: 'acc_other_filter_value',
  FILTER_ADVANCED: 'acc_other_filter_advanced',
  FILTER_ADVANCED_FORM: 'acc_other_filter_advanced_form',
}

@Component({
  selector: 'fan-id-accommodation-other',
  templateUrl: './accommodation-other.component.html',
  styleUrls: ['./accommodation-other.component.scss']
})
export class AccommodationOtherComponent extends AccommodationTableBase implements OnInit, AfterViewInit, OnDestroy {
  @Input() event:any;
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  pageConfig = {
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  dtTrigger = new Subject<any>();
  loading = false;

  indexSaveBool = false;
  indexSave = 0;
  filter: IAccommodationOtherGetListRequest = {};
  dataList: IAccommodationOtherGetListItem[] = [];
  dataColumns = AccommodationOtherDataColumns.filter(({ viewInTable }) => viewInTable);
  tableColumns = [
    {
      title: 'Actions',
    },
    {
      title: "Proof of Accommodation"
    },
    ...(AccommodationOtherDataColumns
      .filter(({ viewInTable }) => viewInTable)
      .map(({ title, dataKey }) => ({ title, value: dataKey })))
  ]
  filterColumns = AccommodationOtherDataColumns.filter(({ filter }) => filter);
  filterForm = this.fb.group({
    column: [null, Validators.required],
    value: [null, Validators.required],
  });
  advancedFilterForm = this.fb.group({
    ...(this.getAdvancedFilterControls())
  });
  private apiUrl: string;
  show_export_modal = false;
  documentPdfSrc: string | null = null;
  showPdfModal = false;
  otherAccommodationCategories = [
    { value: 1, label: 'Hotel' },
    { value: 2, label: 'Private Residence' },
    { value: 3, label: 'Rental' },
  ]
  showResendSuccessModal = false;
  showResendFailModal = false;
  allPermission: any;
  resendPermission: any;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private http: HttpClient,
    private applicantService: ApplicantService,
  ) {
    super();
    this.apiUrl = this.config.apiUrl;
  }

  ngOnInit() {
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.getPermission();
    this.dtOptions = {
      paging: false,
      stateSave:true,
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      ordering: false,
      processing: false,
      info: false,
      lengthChange: false,
      serverSide: true,
      language: {
        emptyTable: '',
        zeroRecords: '',
      },
      ajax: (dataTablesParameters: any, callback) => {
        if (this.indexSaveBool) {
          dataTablesParameters.start = this.indexSave;
        }
        this.indexSave = dataTablesParameters.start;
        this.http
          .post<any>(
            this.apiUrl + '/api/Accommodation/v1/OtherAccommodationGetList',
            {
              ...this.filter,
              pageIndex:
                dataTablesParameters.start / dataTablesParameters.length,
            }
          )
          .pipe(catchError(() => {
            return of({
              dataList: [],
              totalCount: 0
            })
          }))
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
          this.indexSaveBool = false;
      },
      columns: this.tableColumns,
      initComplete: function (settings, json) {
        $('#other-datatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
      preDrawCallback: () => {
        this.dtProcessing$.next(true);
      },
      drawCallback: () => {
        this.dtProcessing$.next(false);
      }
    };
  }

  getPermission() {
    const permissionList = JSON.parse(localStorage.getItem('PermissionList')??"");

    this.resendPermission = permissionList?.roles?.find(
      (element: { key: string;value:any; })=> element?.key === 'Resend Accommodation Notification'
    );
    this.allPermission = permissionList?.fullAccess;
  }

  ngAfterViewInit() {
    this.filter.filter = this.getSavedFilter() as IAccommodationOtherGetListRequestFilter;
    if(!this.filter.filter) delete this.filter.filter;
    else this.setPaging(true);
    this.dtTrigger.next();
  }

  get ff() {
    return this.filterForm.controls;
  }

  get aff() {
    return this.advancedFilterForm.controls;
  }

  getAdvancedFilterControls() {
    const initialValue: Record<string, any> = {}
    return this.filterColumns.reduce((acc, { dataKey }) => {
      acc[dataKey] = [null];
      return acc;
    }, initialValue);
  }

  async getDataList({ clearState = true } = {}) {
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageIndex = 0;
    if (this.indexSaveBool) {
      (await this.dtElement.dtInstance).ajax.reload(undefined, false);
    } else {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        clearState && dtInstance.state.clear();
        // Destroy the table first
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }
  }

  getSavedFilter() {
    try {
      let saved_filter_state = sessionStorage.getItem(SessionStorageKeys.FILTER_STATE);
      if (!saved_filter_state) return null;
      saved_filter_state = JSON.parse(saved_filter_state);
      if (saved_filter_state === EFilterState.NONE) return null;
      if (saved_filter_state === EFilterState.NORMAL) {
        const saved_filter_column = sessionStorage.getItem(SessionStorageKeys.FILTER_COLUMN);
        if (!saved_filter_column) return null;
        const saved_filter_value = sessionStorage.getItem(SessionStorageKeys.FILTER_VALUE);
        const column = JSON.parse(saved_filter_column);
        const value = saved_filter_value ? JSON.parse(saved_filter_value) : null;
        this.ff.column.setValue(column);
        this.ff.value.setValue(value);
        const { dataKey, dataType } = column;
        this.filterState = EFilterState.NORMAL;

        if (dataType === 'string') {
          return { [dataKey]: `#${value}#` }
        }

        if (dataType === 'date') {
          const date = new Date(value.year, value.month - 1, value.day);
          const filterValue = new DatePipe('en-Us').transform(date, 'dd-MM-yyyy');
          return { [dataKey]: filterValue }
        }

        if (dataType === 'otherAccommodationCategory') {
          return { [dataKey]: value }
        }
      } else if (saved_filter_state === EFilterState.ADVANCED) {
        const saved_filter_advanced = sessionStorage.getItem(SessionStorageKeys.FILTER_ADVANCED);
        const saved_filter_form = sessionStorage.getItem(SessionStorageKeys.FILTER_ADVANCED_FORM);
        if (!saved_filter_advanced || !saved_filter_form) return null;
        const filter = JSON.parse(saved_filter_advanced);
        const filter_form = JSON.parse(saved_filter_form);
        this.advancedFilterForm.setValue(filter_form);
        this.filterState = EFilterState.ADVANCED;
        return filter;
      }
    } catch (error) {
      console.log(error);
      return null;
    }

  }

  filterColumn() {
    const { column, value } = this.filterForm.value;
    if (!column || !value) return;
    if (column?.dataType === 'string' && (!value || !value.trim())) return;
    const { dataKey, dataType } = column;
    this.filterState = EFilterState.NORMAL;
    sessionStorage.setItem(SessionStorageKeys.FILTER_COLUMN,JSON.stringify(column));
    sessionStorage.setItem(SessionStorageKeys.FILTER_STATE, JSON.stringify(this.filterState));

    if (dataType === 'string') {
      this.filter.filter = { [dataKey]: `#${value.trim()}#` }
      sessionStorage.setItem(SessionStorageKeys.FILTER_VALUE,JSON.stringify(value.trim()));
    }

    if (dataType === 'date') {
      const date = new Date(value.year, value.month - 1, value.day);
      const filterValue = new DatePipe('en-Us').transform(date, 'dd-MM-yyyy');
      this.filter.filter = {  [dataKey]: filterValue }
      sessionStorage.setItem(SessionStorageKeys.FILTER_VALUE,JSON.stringify(value));
    }

    if (dataType === 'otherAccommodationCategory') {
      this.filter.filter = {  [dataKey]: value }
      sessionStorage.setItem(SessionStorageKeys.FILTER_VALUE,JSON.stringify(value));
    }

    if (this.filterForm.valid) {
      this.setPaging(true);
      this.getDataList();
    }
  }

  applyFilter() {
    this.filterState = EFilterState.ADVANCED;
    const {value: form_value} = this.advancedFilterForm;
    const form_has_value = Object.values(form_value).some(v => v);
    if (form_has_value) {
      const filter: Record<string, any> = {};
      this.filterColumns.forEach(({ dataKey, dataType }) => {
        const value = form_value[dataKey];
        if (value) {
          if (dataType === 'string') {
            value.trim() && (filter[dataKey] = `#${value.trim()}#`);
          }

          if (dataType === 'date') {
            const date = new Date(value.year, value.month - 1, value.day);
            const filterValue = new DatePipe('en-Us').transform(date, 'dd-MM-yyyy');
            filter[dataKey] = filterValue;
          }

          if (dataType === 'otherAccommodationCategory') {
            filter[dataKey] = value;
          }
        }
      })

      if (Object.keys(filter).length) {
        this.filter.filter = filter;
        sessionStorage.setItem(SessionStorageKeys.FILTER_STATE, JSON.stringify(this.filterState));
        sessionStorage.setItem(SessionStorageKeys.FILTER_ADVANCED, JSON.stringify(filter));
        sessionStorage.setItem(SessionStorageKeys.FILTER_ADVANCED_FORM, JSON.stringify(this.advancedFilterForm.value));
        this.setPaging(true);
        this.getDataList();
      }
    }
  }

  onFilterColumnChange() {
    this.ff.value.patchValue(null);
  }

  clearFilter() {
    this.filterForm.reset();
    this.advancedFilterForm.reset();
    this.filterState = EFilterState.NONE;
    delete this.filter.filter;
    sessionStorage.removeItem(SessionStorageKeys.FILTER_STATE);
    sessionStorage.removeItem(SessionStorageKeys.FILTER_COLUMN);
    sessionStorage.removeItem(SessionStorageKeys.FILTER_VALUE);
    sessionStorage.removeItem(SessionStorageKeys.FILTER_ADVANCED);
    this.setPaging(false);
    this.getDataList();
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  clearButton() {
    let result = false;
    if (
      this.filterForm.value.column != null ||
      (this.filterForm.value.value != null && this.filterForm.value.value != '')
    ) {
      result = true;
    }
    return result;
  }

  showExportModal() {
    this.show_export_modal = true;
  }

  async viewDocument(pdfURL: string) {
    this.documentPdfSrc = await this.applicantService.getResourceSafeUrl(pdfURL);
    this.showPdfModal = true;
  }

  closePdfModal() {
    this.documentPdfSrc = null;
    this.showPdfModal = false;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
  resendNotification(data : any){
    console.log(data)
    const body={
      "accommodationType": data?.accommodationType, // 3 means friends and family and 9 means other platform booking
      "bookingRefNumber": data?.bookingRefNumber
    }
    this.http
    .post<any>(
      this.apiUrl+'/api/Accommodation/ReSendAccommodationEmailByRefBookingNumber',
      body
    )
    .subscribe((resp) => {
      if(resp.status == 200)
      {
        this.showResendSuccessModal = true;
        this.showResendFailModal = false;
      }
      else{
        this.showResendFailModal = true;
        this.showResendSuccessModal = false;
      }
    },(err=>{
      this.showResendFailModal = true;
    }));
  }
  closeUpdateFanCategorySuccessFailModal(){
    this.showResendFailModal = false;
    this.showResendSuccessModal = false;

  }
}
