import {
  AfterViewInit,
  Component,
  OnDestroy,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  CardReplacementListData,
  CardReplacementService,
  CardReplacementListColumnName,
} from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Environment, FanIDConfig, MenuService } from '@fan-id/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { catchError } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'fan-id-card-replacement-list',
  templateUrl: './card-replacement-list.component.html',
  styleUrls: ['./card-replacement-list.component.scss'],
})
export class CardReplacementListComponent
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  columns: CardReplacementListColumnName[];
  filteredAppdata: CardReplacementListData[] = null;
  filter: any = {};
  dtOptions: DataTables.Settings | undefined;

  dtTrigger: Subject<any> = new Subject<any>();
  replacement_dialog_open = false;
  replace_confirmation_dialog_open = false;
  replace_full_data:any;
  error_message = '';
  error_dialog_open = false;
  confirm_replace_bool= false;
  show_card_view_bool = false;
  cardReplacement = new FormGroup({
    columnName: new FormControl(),
    filterTxt: new FormControl(),
  });
  public terminalCode:any
  public searchTarget:any =null;
  indexSaveBool:boolean = false;
  indexSave:number =0;
  ApplicationId = 0;
  fanId: string;
  pageConfig: any = {
    id: 'CardReplacePager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };

  filterColumnsSearch = [
    {
      id: 15,
      name: this.translate('TicketReferenceNumber'),
      value: 'ticketNo',
    },
    {
      id: 13,
      name: this.translate('VoucherCode'),
      value: 'voucherCode'
    },
    {
      id: 14,
      name: this.translate('OrderId'),
      value: 'ticketOrderId'
    },
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
      id: 10,
      name: this.translate('MobileNumber'),
      value: 'phone',
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
      value: 'applicationStatus_Name',
    },

    {
      id: 5,
      name: this.translate('FanIDCardStatus'),
      value: 'cardStatus_Name',
    },
    {
      id: 7,
      name: this.translate('SubmissionType'),
      value: 'submissionType_Name',
    },
    {
      id: 11,
      name: this.translate('ApplicationDate'),
      value: 'applicationDate',
    },
    {
      id: 16,
      name: this.translate('PrinterName'),
      value: 'printer_Name',
    },
  ];
  storedSelectColumn:number;
  storedFilterText:string;
  private apiUrl: string;

  card_replacement_filter = {
    // cardStatus: 5,
    inAnyCardStatus: [2, 4, 5, 10, 11],
    applicationStatus: 2,
    eventCode: this.menuService.getSelectedEventCode()
  }
 replaceData:any;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private cardReplacementService: CardReplacementService,
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private menuService: MenuService,
    private translateService: TranslateService,
    public datepipe: DatePipe
  ) {
    this.apiUrl = this.config.apiUrl;
  }

  ngOnInit(): void {
    this.terminalCode = this.menuService.getTerminalCode()
    this.cardReplacement = this.fb.group({
      columnName: [null, Validators.required],
      filterTxt: ['', Validators.required],
    });
    setTimeout(() => {
        this.columns = this.filterColumnsSearch;
      }, 300)
      if(sessionStorage.getItem('columnName')){
        this.storedSelectColumn = parseInt(sessionStorage?.getItem('columnName'))
        this.cardReplacement.get('columnName').setValue(this.storedSelectColumn);
        sessionStorage.removeItem('columnName')
      }
    if(sessionStorage.getItem('filterTxt')){
        this.storedFilterText = sessionStorage?.getItem('filterTxt')
        this.cardReplacement.get('filterTxt').patchValue(this.storedFilterText);
        sessionStorage.removeItem('filterTxt')
    }

    if(this.storedSelectColumn && this.storedFilterText){
      let filterValue: any;
      for (const filcol of this.filterColumnsSearch) {
        if (filcol.id == this.cardReplacement.get('columnName')?.value) {
          filterValue = this.cardReplacement.get('filterTxt')?.value;
          this.searchTarget = { [filcol.value]: '#' +filterValue + '#' }
        }
      }
      const filter = {
        //serivceCenterCode:this.terminalCode, //commented as per requirement on 27 nov 2021
        ...this.card_replacement_filter
      }
      if(this.searchTarget != null){
        this.filter.filter =  Object.assign(filter,this.searchTarget);
      }
      else{
        this.filter.filter = filter;
      }
    }

    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.dtOptions = {
      // select:'multiple',
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
                emptyTable:"",
                zeroRecords: ""
              },
              ajax: (dataTablesParameters: any, callback) => {
                if(this.indexSaveBool === true){
                  dataTablesParameters.start = this.indexSave;
                }
                this.indexSave = dataTablesParameters.start;
                this.http
                  .post<any>(
                    this.config.apiUrl+'/api/CustomerCardApplication/get-List-by-Service-Center',
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
              columns: [
                {
                  title: this.translate('Actions'),
                },
                {
                  title: this.translate('ApplicationDate'),
                  data: 'applicationDate',
                },
                {
                  title: this.translate('ApplicationStatus'),
                  data: 'applicationStatus_Name',
                },

                {
                  title: this.translate('ApplicationNumber'),
                  data: 'applicationNo',
                },
                {
                  title: this.translate('FanIDNumber'),
                  data: 'fanIdNo',
                },
                {
                  title: this.translate('FirstName'),
                  data: 'firstName',
                },
                {
                  title: this.translate('LastName'),
                  data: 'lastName',
                },
                {
                  title: this.translate('FanIDCardStatus'),
                  data: 'cardStatus_Name'
                },
                {
                  title: this.translate('OrderId'),
                  data: 'ticketOrderId',
                },
                {
                  title: this.translate('TicketReferenceNumber'),
                  data: 'ticketNo',
                },
                {
                  title: this.translate('VoucherCode'),
                  data: 'voucherCode',
                },
                {
                  title: this.translate('SubmissionType'),
                  data: 'submissionType_Name',
                },
                {
                  title: this.translate('NoOfDependents'),
                  data: 'dependentCount',
                },
                {
                  title: this.translate('PrinterName'),
                  data: 'printer_Name',
                },

              ],
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };

  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  translate(key: string) {
    const translateKey = 'CardReplacement';
    return this.translateService.instant(translateKey + '.' + key);
  }

  public filterColumn() {
    let filterValue: any;
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.cardReplacement.get('columnName')?.value) {
        filterValue = this.cardReplacement.get('filterTxt')?.value;
        // }
        this.searchTarget =
        filcol.id !== 11
            ? { [filcol.value]: '#' +filterValue + '#' }
            : { [filcol.value]: filterValue };
      }
    }
    if (this.cardReplacement.valid) {
      this.getList();
    }
  }

  action() {
    console.log('view details');
    this.router.navigate(['main/card-replacement/list/view-details']);
  }

  clearFilter() {
    this.indexSaveBool = false;
    this.searchTarget = null;
    this.cardReplacement.reset();
  }
  tableShowHide() {
    let result = false;
    if (this.searchTarget === null) {
      result = true;
    }
    return result;
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }
  closeReplacementDialog(closeData: any) {
    this.replacement_dialog_open = false;
    this.show_card_view_bool = false;
    if (closeData) {
      console.log('closedataa', closeData);
      if (closeData.Reason !== 'Update Info') {
        this.show_card_view_bool = true;

        this.replaceData = closeData;
      } else {
        this.router.navigate(['main/card-replacement/list/edit-details'],
        {
          queryParams: { submitReasonType: 3, fanid: this.fanId },
        }
        );
      }
    }
  }
  closeReplacementConfirmation() {
    this.replace_confirmation_dialog_open = false;
    this.error_dialog_open = false;
    this.indexSaveBool = true;
    this.getList();
  }
  async getList(){
    const filter ={
      // serivceCenterCode:this.terminalCode, //commented as per requirement on 27 nov 2021
      ...this.card_replacement_filter
    }
    if(this.searchTarget != null){
      this.filter.filter =  Object.assign(filter,this.searchTarget);
    }
    else{
      this.filter.filter = filter;
    }
    if(this.indexSaveBool){
      (await this.dtElement.dtInstance).ajax.reload( null, false );
    }
    else{
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

      // this.cardReplacementService
      //   .getApplicationData(this.filter)
      //   .pipe(first())
      //   .subscribe(
      //     // (response: CardReplacementListData[]) => {
      //     (response: any) => {
      //       let allAppsArray: any = [];
      //     for (let apps of response?.dataList) {
      //       let allApplicationObject: any = new Object();
      //       allApplicationObject.id = apps?.id;
      //       allApplicationObject.applicationnumber = apps?.applicationNo;
      //       allApplicationObject.applicationdate = apps?.applicationDate;


      //     },
      //     (error) => console.error(error)
      //   );

  }
  cardReplaceRequest(id, fanid,data){
    this.ApplicationId = id;
    this.fanId = fanid;
    this.replace_full_data = data;
    this.replacement_dialog_open = true
  }
  viewdetails(fanId, id){
      sessionStorage.setItem('columnName',this.cardReplacement.get('columnName')?.value)
      sessionStorage.setItem('filterTxt',this.cardReplacement.get('filterTxt')?.value)
      this.router.navigate(['/main/card-replacement/list/view-details'],
      {
        queryParams: { fanid: fanId, id: id },
      }
      );
  }

  Confirmation(event){

    this.confirm_replace_bool = false;
    if(event=='ok'){
        this.cardReplacementService.CustomerCardPrinting(this.replaceData)
        .subscribe(response=>{
          if(response?.printingStatus === 200) {
            this.replace_confirmation_dialog_open = true;
          } else {
            this.error_message = response?.message || "Something went wrong!";
            this.error_dialog_open = true
          }
        },
        err=>{
            this.error_message = err?.error?.message || "Something went wrong!";
            this.error_dialog_open = true
        })
    }
  }
  dateFM(date){
    const formattedInitDate = moment(date +'Z');
    const finalDate = formattedInitDate.toLocaleString();
    return new DatePipe('en-Us').transform(finalDate, 'dd-MM-yyyy hh:mm:ss a');
  }
  Refresh(){
    this.indexSaveBool = false;
    this.getList();
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

}
