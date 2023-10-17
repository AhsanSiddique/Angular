import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApplicantService, IAccommodationAlternateGetListRequest, IAccommodationAlternateGetListRequestFilter, IAccommodationAlternateObject } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { DataTableDirective } from 'angular-datatables';
import { of, Subject } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { dataColumns } from './alternate.columns';
import { EFilterState } from '../accommodation.common';
import { AccommodationTableBase } from '../accommodation-table.base';
import { DomSanitizer } from '@angular/platform-browser';

const SessionStorageKeys = {
  FILTER_STATE: 'acc_alternate_filter_state',
  FILTER_COLUMN: 'acc_alternate_filter_column',
  FILTER_VALUE: 'acc_alternate_filter_value',
  FILTER_ADVANCED: 'acc_alternate_filter_advanced',
  FILTER_ADVANCED_FORM: 'acc_alternate_filter_advanced_form',
}

@Component({
  selector: 'fan-id-accommodation-alternate',
  templateUrl: './accommodation-alternate.component.html',
  styleUrls: ['./accommodation-alternate.component.scss']
})
export class AccommodationAlternateComponent extends AccommodationTableBase implements OnInit, AfterViewInit, OnDestroy {
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
  filter: IAccommodationAlternateGetListRequest = {};
  dataList: IAccommodationAlternateObject[] | null = [];
  dataColumns = dataColumns;
  tableColumns = [
    {
      title: "Actions"
    },
    {
      title: "Proof of Accommodation"
    },
    ...(dataColumns.map(({ title, dataKey }) => ({title, value: dataKey})))
  ]
  filterColumns = dataColumns.filter(({ filter }) => filter);
  filterForm = this.fb.group({
    column: [null, Validators.required],
    value: [null, Validators.required],
  });
  advancedFilterForm = this.fb.group({
    ...(this.getAdvancedFilterControls())
  });
  private apiUrl: string;
  show_export_modal = false;
  documentpdfSrc: string | null = null;
  showpdfModal = false;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private http: HttpClient,
    private applicantService: ApplicantService,
    private sanitizer: DomSanitizer
  ) {
      super();
      this.apiUrl = this.config.apiUrl;
    }

  ngOnInit() {
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
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
            this.apiUrl+'/api/Accommodation/AlternateAccodmationVerificationGetList',
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
        $('#alternate-datatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
      preDrawCallback: () => {
        this.dtProcessing$.next(true);
      },
      drawCallback: () => {
        this.dtProcessing$.next(false);
      }
    };
  }

  ngAfterViewInit(): void {
    this.filter.filter = this.getSavedFilter() as IAccommodationAlternateGetListRequestFilter;
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
        if (dataType === 'date') {
          const date = new Date(value.year, value.month - 1, value.day);
          const filterValue = new DatePipe('en-Us').transform(date, 'dd-MM-yyyy');
          return { [dataKey]: filterValue }
        } else {
          return { [dataKey]: `#${value}#` }
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
    if (dataType === 'date') {
      const date = new Date(value.year, value.month - 1, value.day);
      const filterValue = new DatePipe('en-Us').transform(date, 'dd-MM-yyyy');
      this.filter.filter = {  [dataKey]: filterValue }
      sessionStorage.setItem(SessionStorageKeys.FILTER_VALUE,JSON.stringify(value));
    } else {
      this.filter.filter = { [dataKey]: `#${value.trim()}#` }
      sessionStorage.setItem(SessionStorageKeys.FILTER_VALUE,JSON.stringify(value.trim()));
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
          if (dataType === 'date') {
            const date = new Date(value.year, value.month - 1, value.day);
            const filterValue = new DatePipe('en-Us').transform(date, 'dd-MM-yyyy');
            filter[dataKey] = filterValue;
          } else {
            value.trim() && (filter[dataKey] = `#${value.trim()}#`);
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
    this.filter.filter = {};
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

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  async viewDocument(pdfURL: string) {
    this.documentpdfSrc = await this.applicantService.getResourceSafeUrl(pdfURL);
    this.showpdfModal = true;
  }

  closepdfModal() {
    this.showpdfModal = false;
    this.documentpdfSrc = null;
  }
}
