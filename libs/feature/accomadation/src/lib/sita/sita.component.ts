import { AfterViewInit, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AllApplicationsService, CardReplacementListColumnName } from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { Environment, FanIDConfig } from '@fan-id/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { DatePipe } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { convertDateDDMMYYYYToMMDDYYYY, convertDateStringToNgbDate, convertNgbDateToDDMMYYYY } from '@fan-id/shared/utils/date';

enum SearchType {
  Text = 1,
  Date = 2,
  Select = 3
}
@Component({
  selector: 'fan-id-sita',
  templateUrl: './sita.component.html',
  styleUrls: ['./sita.component.scss']
})
export class SitaComponent implements  OnInit,AfterViewInit,OnDestroy {
  @Output() filterBooleans = new EventEmitter<any>();
  @Input() event:any;
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings | undefined;
  pageConfig: any = {
    id: 'sitaPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  card_pickup_filter = {
  }
  dtTrigger: Subject<any> = new Subject<any>();
  applicationActionsList:any=[];

  searchSelectItems$: Observable<unknown[]> = of([]);
  selectedSearchColumnType = SearchType.Text;
  columns: CardReplacementListColumnName[] | undefined;
  loading = false;
  advancedFilterBoolean = false;
  sitaFilterForm = new FormGroup({
    columnName: new FormControl(null, Validators.required),
    filterTxt: new FormControl(null, Validators.required),
    hayyaCardNumber: new FormControl(null),
    brn: new FormControl(null),
    dn: new FormControl(null),
    bs: new FormControl(null),
    fn: new FormControl(null),
    email: new FormControl(null),
    avdate: new FormControl(null),
    bcd: new FormControl(null),
    cd: new FormControl(null),
  });
  filterColumnsSearch : { id: number, name: string, value: string, type?: SearchType, list?: any }[]= [
    {
      id: 1,
      name: 'Hayya Card Number',
      value: 'fanIdNo',
    },
    {
      id: 2,
      name: 'Full Name',
      value: 'customer_FullName'
    },
    {
      id: 3,
      name: 'Email ID',
      value: 'customer_Email'
    },
    {
      id: 4,
      name: 'Booking Ref. Number',
      value: 'bookingRefNumber',
    },
    {
      id: 5,
      name: 'Document Number',
      value: 'bookingRefDoumentNumber',
    },
    {
      id: 6,
      name: 'Booking Status',
      value: 'bookingStatus',
    },
    {
      id: 7,
      name: 'Accommodation Verification Date',
      value: 'accommodationVerificationDate',
      type: SearchType.Date
    },
    {
      id: 8,
      name: 'Booking Cancellation Date',
      value: 'bookingCancellationDate',
      type: SearchType.Date
    },
    {
      id: 9,
      name: 'System Cancellation Date',
      value: 'cancellationDate',
      type: SearchType.Date
    },
  ];

  indexSaveBool = false;
  indexSave = 0;
  private apiUrl: string;
  filter: any = {};
  sitaFilterForm_filter: { accommodationType: number}
  sitafilteredAppdata: any = [];
  storedSelectColumn!: number;
  storedFilterText!: string | number;
  normalFilterBoolean = false;
  show_export_modal = false;arrayOffilters=[];
  advFilterStored=[];
  dtProcessing$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private translateService: TranslateService,
    private http: HttpClient,
    private aps: AllApplicationsService) {
      this.apiUrl = this.config.apiUrl;

      this.sitaFilterForm_filter= { accommodationType: 2}
      this.setSendingBoolean();
    }

  ngOnInit(): void {
    // this.sitaFilterForm = this.fb.group({
    //   columnName: [null, Validators.required],
    //   filterTxt: ['', Validators.required],
    // });
    this.columns = this.filterColumnsSearch;
    // if (this.searchTarget != null) {
    //   this.filter.filter = Object.assign(filter, this.searchTarget);
    // } else {
    //   this.filter.filter = filter;
    // }
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.filter = this.sitaFilterForm_filter;
    this.filterLoadingInitial();
    const paging = this.normalFilterBoolean || this.advancedFilterBoolean;
    this.dtOptions = {
      paging,
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
        if(this.indexSaveBool === true){
          dataTablesParameters.start = this.indexSave;
        }
        this.indexSave = dataTablesParameters.start;
        this.http
          .post<any>(
            this.apiUrl+'/api/Accommodation/GetList',
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
             if(resp.dataList){
             this.sitafilteredAppdata = resp.dataList
            }
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
            this.setSendingBoolean();
          });
          this.indexSaveBool = false;
      },
      columns: [
        {
        },
        {
          data: 'fanIdNo',
        },
        {
          data: 'customer_FullName',
        },
        {
          data: 'customer_Email',
        },
        {
          data: 'bookingRefNumber',
        },
        {
          data: 'bookingRefDoumentNumber',
        },
        {
          data: 'bookingStatus',
        },
        {
          data: 'accommodationVerificationDate',
        },
        {
          data: 'bookingCancellationDate',
        },
        {
          data: 'cancellationDate',
        },

      ],
      initComplete: function (settings, json) {
        $('#importdatatablesita').wrap("<div class='fan-id-tablewrap'></div>");
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
    this.dtTrigger.next();
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }
  translate(key: string) {
    const translateKey = "CardPickup";
    return this.translateService.instant(translateKey + '.' + key);
  }
  clearFilter(){

    this.normalFilterBoolean = false;
    this.advancedFilterBoolean = false;
    this.indexSaveBool = false;

    localStorage.removeItem('DataTables_importdatatablesita_/main/accomadation');
    sessionStorage.removeItem('sitaFilterFormColumnName');
    sessionStorage.removeItem('sitaFilterFormFilterTxt');
    sessionStorage.removeItem('advSITAFilters');
    this.sitaFilterForm.reset();
    this.filter = {};
    this.sitaFilterForm_filter= { accommodationType: 2}
    this.filter.filter = this.sitaFilterForm_filter;
    this.setPaging(false);
    this.getsitaList();
  }
  getSelectedSearchColumn() {
    const value = this.sitaFilterForm?.get('columnName')?.value;
    return this.filterColumnsSearch.find((element) => element?.id === value)
  }

  getSelectedSearchColumnType() {
    console.log('get searchColumnType');
    return this.getSelectedSearchColumn()?.type ?? SearchType.Text;
  }
  changeColumn() {
    this.sitaFilterForm.get('filterTxt').patchValue(null);
    this.selectedSearchColumnType = this.getSelectedSearchColumnType()
    this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
  }
  spacetext() {
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && !this.sitaFilterForm.get('filterTxt')?.value.replace(/\s/g, '').length
    ) {
      result = true;
    }
    return result;
  }
  textTypeLength(){
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && this.sitaFilterForm.get('filterTxt')?.value.length<3
    ) {
      result = true;
    }
    return result;
  }
  public filterColumn() {

    this.normalFilterBoolean = true;
    this.advancedFilterBoolean = false;
    localStorage.removeItem(
      'DataTables_importdatatablesita_/main/accomadation'
    );
    if (
      this.sitaFilterForm.value.columnName != null ||
      this.sitaFilterForm.value.filterTxt != null
    ) {
      sessionStorage.setItem(
        'sitaFilterFormColumnName',
        this.sitaFilterForm.get('columnName')?.value
      );
      sessionStorage.setItem(
        'sitaFilterFormFilterTxt',
        JSON.stringify(this.sitaFilterForm.get('filterTxt')?.value)
      );
    } else {
      sessionStorage.removeItem('sitaFilterFormColumnName');
      sessionStorage.removeItem('sitaFilterFormFilterTxt');
    }
    let filterValue: any;
    this.filter.filter = this.sitaFilterForm_filter;
    const currentFilter = this.filter.filter ?? {};
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.sitaFilterForm.get('columnName')?.value) {
        if(this.selectedSearchColumnType === SearchType.Text) {
          filterValue = this.sitaFilterForm.get('filterTxt')?.value?.trim();
        }
        else if(filcol.type === SearchType.Date) {
          const formattedInitDate = this.sitaFilterForm.value.filterTxt;
          const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
          filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
        }
        else if(filcol.type === SearchType.Select) {
          filterValue = this.sitaFilterForm.get('filterTxt')?.value;
        }
          this.filter.filter =
          (this.selectedSearchColumnType === SearchType.Text)
            ? {...currentFilter, [filcol.value]: '#' + filterValue + '#' }
            : {...currentFilter, [filcol.value]: filterValue };
      }
    }
    if (this.sitaFilterForm.valid) {
      this.setPaging(true);
      this.getsitaList();
    }
  }

  async getsitaList() {
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2}];
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

  filterLoadingInitial() {
    if (sessionStorage.getItem('sitaFilterFormColumnName')) {
      this.storedSelectColumn = parseInt(
        sessionStorage?.getItem('sitaFilterFormColumnName')
      );
      this.sitaFilterForm.get('columnName').setValue(this.storedSelectColumn);
    }
    const filterTxt = JSON.parse(sessionStorage?.getItem('sitaFilterFormFilterTxt'));
    if (filterTxt) {
      this.storedFilterText = !isNaN(parseInt(filterTxt)) ? parseInt(filterTxt) : filterTxt;
      // this.sitaFilterForm.get('filterTxt').patchValue(this.storedFilterText);
    }
    this.columns = this.filterColumnsSearch;
    this.filter.filter = this.sitaFilterForm_filter;
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    //below reload current page and filters
    if (this.storedSelectColumn  && (this.storedFilterText != null && this.storedFilterText !== '')) {
      this.normalFilterBoolean = true;
      this.advancedFilterBoolean = false;
      let filterValue: unknown;
      for (const filcol of this.filterColumnsSearch) {
        const currentFilter = this.filter?.filter ?? {};
        if (filcol.id == this.sitaFilterForm.get('columnName')?.value) {
          this.selectedSearchColumnType = filcol.type ?? SearchType.Text;
          if(this.selectedSearchColumnType === SearchType.Text) {
            const _filterTxt = this.storedFilterText;
            filterValue = _filterTxt.toString().trim();
            this.sitaFilterForm.get('filterTxt').patchValue(filterValue);
          } else if(filcol.type === SearchType.Date) {
            const formattedInitDate = this.storedFilterText as unknown as NgbDateStruct;
            this.sitaFilterForm.get('filterTxt')?.patchValue(formattedInitDate);
            const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
            filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
          } else if(this.selectedSearchColumnType === SearchType.Select) {
            this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
            filterValue = this.storedFilterText;
            this.sitaFilterForm.get('filterTxt').patchValue(filterValue);
          }


            this.filter.filter =
            (this.selectedSearchColumnType === SearchType.Text)
              ? { ...currentFilter, [filcol.value]: '#' + filterValue + '#' }
              : { ...currentFilter, [filcol.value]: filterValue };
        }
      }
    }
    else{
      if(sessionStorage.getItem("advSITAFilters")){
        this.advFilterStored = JSON.parse(sessionStorage.getItem("advSITAFilters"));
        if(this.advFilterStored){
          this.advancedFilterBoolean = true;
          this.normalFilterBoolean = false;
          this.advFilterStored.forEach(item=>{
            if(item.controlname === 'avdate' || item.controlname === 'bcd' || item.controlname === 'cd'){
              let ddmmyytommddyy = convertDateDDMMYYYYToMMDDYYYY(item.value)
              this.sitaFilterForm.controls[item.controlname].patchValue(convertDateStringToNgbDate(ddmmyytommddyy));
            }
            else{
              this.sitaFilterForm.controls[item.controlname].patchValue(item.value);
            }
            if(item.hashed){
              this.filter.filter[item.col] =
                '#' + item.value + '#';
            }
            else{
              this.filter.filter[item.col] = item.value;
            }
          })
        }
      }
    }
  }
  clearButton() {
    let result = false;
    if (
      this.sitaFilterForm.value.columnName != null ||
      (this.sitaFilterForm.value.filterTxt != null && this.sitaFilterForm.value.filterTxt != '')
    ) {
      result = true;
    }
    return result;
  }
  showExportModal(){
    this.show_export_modal = true;

  }
  advancedSearch(){
    sessionStorage.removeItem('advSITAFilters');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_importdatatablesita_/main/accomadation'
    );
    this.advancedFilterBoolean = true;
    this.normalFilterBoolean = false;
    this.sitaFilterForm.get('filterTxt')?.reset();
    this.sitaFilterForm.get('columnName')?.reset();
    this.filter = {};
    this.sitaFilterForm_filter= { accommodationType: 2}
    this.filter.filter = this.sitaFilterForm_filter;
    this.setAdvancedSearchFilters();
    this.setPaging(true);
    this.getsitaList();
  }

  onClearFilter(){
    sessionStorage.removeItem('advSITAFilters');
    this.arrayOffilters = [];
    this.sitaFilterForm.reset();
    this.advancedFilterBoolean = false;
    this.normalFilterBoolean = false;
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.sitaFilterForm_filter= { accommodationType: 2}
    this.filter.filter = this.sitaFilterForm_filter;
    this.setPaging(false);
    this.getsitaList();
  }

  setAdvancedSearchFilters() {
    this.setAdvancedSearchFiltersText();
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('avdate')?.value)) {
      this.filter.filter['accommodationVerificationDate'] = convertNgbDateToDDMMYYYY(
        this.sitaFilterForm?.get('avdate')?.value
      );
      this.arrayOffilters.push({col:'accommodationVerificationDate', value:convertNgbDateToDDMMYYYY(this.sitaFilterForm?.get('avdate')?.value), controlname:'avdate' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('bcd')?.value)) {
      this.filter.filter['bookingCancellationDate'] = convertNgbDateToDDMMYYYY(
        this.sitaFilterForm?.get('bcd')?.value
      );
      this.arrayOffilters.push({col:'bookingCancellationDate', value:convertNgbDateToDDMMYYYY(this.sitaFilterForm?.get('bcd')?.value), controlname:'bcd' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('cd')?.value)) {
      this.filter.filter['cancellationDate'] = convertNgbDateToDDMMYYYY(
        this.sitaFilterForm?.get('cd')?.value
      );
      this.arrayOffilters.push({col:'cancellationDate', value:convertNgbDateToDDMMYYYY(this.sitaFilterForm?.get('cd')?.value), controlname:'cd' ,hashed:false})
    }
    sessionStorage.setItem("advSITAFilters", JSON.stringify(this.arrayOffilters));
  }
  setAdvancedSearchFiltersText(){
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('hayyaCardNumber')?.value)) {
      this.filter.filter['fanIdNo'] =
        '#' + this.sitaFilterForm?.get('hayyaCardNumber')?.value + '#';
         this.arrayOffilters.push({col:'fanIdNo', value:this.sitaFilterForm?.get('hayyaCardNumber')?.value, controlname:'hayyaCardNumber' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('brn')?.value)) {
      this.filter.filter['bookingRefNumber'] =
        '#' + this.sitaFilterForm?.get('brn')?.value + '#';
         this.arrayOffilters.push({col:'bookingRefNumber', value:this.sitaFilterForm?.get('brn')?.value, controlname:'brn' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('dn')?.value)) {
      this.filter.filter['bookingRefDoumentNumber'] =
        '#' + this.sitaFilterForm?.get('dn')?.value + '#';
         this.arrayOffilters.push({col:'bookingRefDoumentNumber', value:this.sitaFilterForm?.get('dn')?.value, controlname:'dn' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('bs')?.value)) {
      this.filter.filter['bookingStatus'] =
        '#' + this.sitaFilterForm?.get('bs')?.value + '#';
         this.arrayOffilters.push({col:'bookingStatus', value:this.sitaFilterForm?.get('bs')?.value, controlname:'bs' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('fn')?.value)) {
      this.filter.filter['customer_FullName'] =
        '#' + this.sitaFilterForm?.get('fn')?.value + '#';
         this.arrayOffilters.push({col:'customer_FullName', value:this.sitaFilterForm?.get('fn')?.value, controlname:'fn' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.sitaFilterForm?.get('email')?.value)) {
      this.filter.filter['customer_Email'] =
        '#' + this.sitaFilterForm?.get('email')?.value + '#';
         this.arrayOffilters.push({col:'customer_Email', value:this.sitaFilterForm?.get('email')?.value, controlname:'email' ,hashed:true})
    }
  }
  advancedFilterClick(){
    document.getElementById('toggleSitaAdvFilter')?.click()
  }
  setSendingBoolean(){
    const sendingBoolean ={
      normal:this.normalFilterBoolean,
      advanced:this.advancedFilterBoolean
    }
    this.filterBooleans.emit(sendingBoolean);
  }

  setPaging(state: boolean) {
    this.dtOptions && (this.dtOptions.paging = state);
  }

}

