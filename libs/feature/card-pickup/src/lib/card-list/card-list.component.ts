import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  CardReplacementListData,
  CardPickupService,
  CardReplacementListColumnName,
  FanIdCardStatusList,
  ApplicationStatusList,
  MetaDataLookup,
  NationalityLookup,
  MetadataParams,
  MetadataService,
  ApplicationStatus,
  AllApplicationsService,
  ApplicantService,
} from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Environment, FanIDConfig, MenuService } from '@fan-id/core';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { catchError, take } from 'rxjs/operators';
import * as moment from 'moment';
import { CancelPrintRequest } from '@fan-id/api/server';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { convertDateDDMMYYYYToMMDDYYYY, convertDateStringToNgbDate, convertNgbDateToDDMMYYYY } from '@fan-id/shared/utils/date';

import jsPDF from 'jspdf';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import html2canvas from "html2canvas";
import { NgxSpinnerService } from 'ngx-spinner';
import { Guid } from "guid-typescript";

enum SearchType {
  Text = 1,
  Date = 2,
  Select = 3
}
@Component({
  selector: 'fan-id-card-list',
  templateUrl: './card-list.component.html',
  styleUrls: ['./card-list.component.scss'],
})
export class CardListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  @ViewChild('matchPass') matchPass: ElementRef;

  showCommonDialogue = false;
  columns: CardReplacementListColumnName[];
  filteredAppdata: CardReplacementListData[];
  dtOptions: DataTables.Settings | undefined;


  pageConfig: any = {
    id: 'CardPickUpPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  dtTrigger: Subject<any> = new Subject<any>();
  replacement_dialog_open = false;
  replace_confirmation_dialog_open = false;
  CardPickup = new FormGroup({
    columnName: new FormControl(null, Validators.required),
    filterTxt: new FormControl(null, Validators.required),
    doctype: new FormControl(1),
    eventType : new FormControl('FWC22'),
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
    prntrname: new FormControl(null),
  });
  common: {
    header: string;
    body: string;
    fanId:string;
  };
  showPrintListDialogue: boolean;
  showDirectPrintPreview:boolean;
  filter: any = {};
  terminalCode: any;
  subStatus: any;
  EventTypeList :any[];
  public id: Guid;
  filterColumnsSearch: { id: number, name: string, value: string, type?: SearchType, list?: any }[] = [
    // {
    //   id: 15,
    //   name: this.translate('TicketReferenceNumber'),
    //   value: 'ticketNo',
    // },
    // {
    //   id: 13,
    //   name: this.translate('VoucherCode'),
    //   value: 'voucherCode'
    // },
    // {
    //   id: 14,
    //   name: 'Ticket Application Number',
    //   value: 'ticketOrderId'
    // },

    {
      id: 2,
      name: this.translate('ApplicationStatus'),
      value: 'applicationStatus',
      type: SearchType.Select,
      list: this.metadataService.getApplicationStatuses()
    },
    {
      id: 4,
      name: this.translate('FanIDNumber'),
      value: 'fanIdNo',
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
      id: 5,
      name: this.translate('FanIDCardStatus'),
      value: 'cardStatus',
      type: SearchType.Select,
      list: this.metadataService.getHayyaCardStatuses()
    },
    {
      id: 12,
      name: this.translate('DocumentNumber'),
      value: 'documentIdNo',
    },
    {
      id: 1,
      name: this.translate('ApplicationNumber'),
      value: 'applicationNo',
    },
    // {
    //   id: 3,
    //   name: this.translate('MobileNumber'),
    //   value: 'phone',
    // },
    // {
    //   id: 3,
    //   name: 'Fan-ID Card Status',
    //   value: 'cardStatus', // not received yet
    // },

    // {
    //   id: 6,
    //   name: this.translate('PrintorIssueCard'),
    //   value: 'printingStatus_Name',
    // },

    // {
    //   id: 10,
    //   name: this.translate('SubmissionType'),
    //   value: 'submissionType_Name',
    // },

    // {
    //   id: 11,
    //   name: this.translate('ApplicationDate'),
    //   value: 'applicationDate',
    // },
    {
      id: 16,
      name: this.translate('PrinterName'),
      value: 'printer_Name',
    },
  ]
  searchTarget: any = null;
  fanIdnumber = '';
  private apiUrl: string;
  error_message = '';
  error_dialog_open = false;
  error_dialog_open_update_status_failed = false;
  updateCardStatusId = 0;
  card_pickup_filter = {
    // cardStatus: 4,
   // applicationStatus: 2,
    eventCode: this.menuService.getSelectedEventCode(),
    docTypeId: 1,
    inAnyApplicationStatus: [
      2
    ],
  }
  updateStatusModalOpen = false;
  indexSave = 0;
  indexSaveBool = false;

  show_import_status_modal = false;
  import_status: 'success' | 'fail' | null = null;
  import_status_error: string;
  import_status_data = {
    totatlSuccess: 0,
    totatlFailed: 0
  }
  storedSelectColumn:number;
  storedFilterText:string;
  cancelPrintId:number;
  show_print_cancel_modal = false;
  printCancelErrorMessage ='';
  print_cancel_error = false;
  print_cancel_success = false;
  showCancelPrint = false;
  isServiceCenter: boolean;
  normalFilterBoolean = false;
  advancedFilterBoolean = false;
  cardStatusList: FanIdCardStatusList[];
  ApplicationStatusNameList: ApplicationStatusList[];
  serviceCentreList: Observable<MetaDataLookup[]>;
  DocTypeList: Observable<MetaDataLookup[]>;
  countries: Observable<NationalityLookup[]>;
  metaDataLookupParam: MetadataParams = {};
  submissionType: any;
  searchSelectItems$: Observable<unknown[]> = of([]);
  accommodationTypes$: Observable<{value: number, name: string}[]> = of([]);
  selectedSearchColumnType = SearchType.Text;
  dateToday!: NgbDateStruct;
  arrayOffilters=[];
  advFilterStored=[];
  cardPrintList: any =[];
  directPrint = true;
  singleSuccessPopup = false;
  printerName:string;
  printSingleSuccessMessage = '';
  singleFailedPopup = false;
  printSingleFailedMessage = '';
  showMultiplePrintList = false;
  sendPrintLabel = '';
  reprintBool = false;
  printMatchPassImage: string;
  printMatchPassData: any;
  showMatchPass: boolean =false;
  eventName: string;
  displayEventName;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private cardPickupService: CardPickupService,
    private router: Router,
    private http: HttpClient,
    private menuService: MenuService,
    private translateService: TranslateService,
    public datepipe: DatePipe,
    private cd: ChangeDetectorRef,
    private metadataService: MetadataService,
    private aps: AllApplicationsService,
    private spinner:NgxSpinnerService,
    private applicantService: ApplicantService,
  ) {
    this.apiUrl = this.config.apiUrl;
    const today = new Date();
    this.dateToday = {
			year: today.getFullYear(),
			month: today.getMonth()+1,
			day: today.getDate(),
		};
    this.printerName = JSON.parse(localStorage.getItem('Printer')).printerName
  }

  ngOnInit(): void {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    if (this.isServiceCenter) {
      this.showCancelPrint = false;
      const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
          this.showCancelPrint  = permissionList?.fullAccess;

    }

    this.terminalCode = this.menuService.getTerminalCode();
    this.common = {
      header: '',
      body: '',
      fanId: ''
    }

    this.columns = this.filterColumnsSearch;
    // if (sessionStorage.getItem('CardPickupColumnName')) {
    //   this.storedSelectColumn = parseInt(sessionStorage?.getItem('CardPickupColumnName'))
    //   this.CardPickup.get('columnName').setValue(this.storedSelectColumn);
    // }
    // if (sessionStorage.getItem('CardPickupFilterTxt')) {
    //   this.storedFilterText = sessionStorage?.getItem('CardPickupFilterTxt')
    //   this.CardPickup.get('filterTxt').patchValue(this.storedFilterText);
    // }

    const CardPickupColumnName = sessionStorage.getItem('CardPickupColumnName');
    let CardPickupFilterTxt = sessionStorage.getItem('CardPickupFilterTxt');

    if (CardPickupColumnName) {
      this.storedSelectColumn = parseInt(CardPickupColumnName);
      this.CardPickup.get('columnName').setValue(this.storedSelectColumn);
    }
    const filterTxt = CardPickupFilterTxt ? JSON.parse(CardPickupFilterTxt) : null;
    if (filterTxt) {
      this.storedFilterText = !isNaN(parseInt(filterTxt)) ? parseInt(filterTxt) : filterTxt;
    }
    const CardPickupDocType = sessionStorage.getItem('CardPickupDocType');
    const docType = CardPickupDocType ? parseInt(CardPickupDocType) : 1;
    this.CardPickup.get('doctype').setValue(docType);
    this.card_pickup_filter = this.getCardPickupFilter();
    const filter = {
      // serivceCenterCode: this.terminalCode, //commented as per requirement on 27 nov 2021
      ...this.card_pickup_filter
    }
    this.filter.filter = filter;
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    console.log(this.storedSelectColumn, this.storedFilterText)
    if (this.storedSelectColumn && (this.storedFilterText != null && this.storedFilterText !== '')) {
      this.normalFilterBoolean = true;
      let filterValue: unknown;
      for (const filcol of this.filterColumnsSearch) {
        const currentFilter = this.filter?.filter ?? {};//new
        if (filcol.id == this.CardPickup.get('columnName')?.value) {
          this.selectedSearchColumnType = filcol.type ?? SearchType.Text;//new
          if(this.selectedSearchColumnType === SearchType.Text) {
            const _filterTxt = this.storedFilterText;
            filterValue = _filterTxt.toString().trim();
            this.CardPickup.get('filterTxt').patchValue(filterValue);
          } else if(filcol.type === SearchType.Date) {
            const formattedInitDate = this.storedFilterText as unknown as NgbDateStruct;
            this.CardPickup.get('filterTxt')?.patchValue(formattedInitDate);
            const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
            filterValue = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
          }
          else if(this.selectedSearchColumnType === SearchType.Select) {

            this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
            filterValue = this.storedFilterText;
            this.CardPickup.get('filterTxt').patchValue(filterValue);
          }

            this.filter.filter = (this.selectedSearchColumnType === SearchType.Text)
              ? {...currentFilter, [filcol.value]: '#' + filterValue + '#' }
              : {...currentFilter, [filcol.value]: filterValue };
        }
      }
      // if (this.searchTarget != null) {
      //   this.filter.filter = Object.assign(filter, this.searchTarget);
      // } else {
      //   this.filter.filter = filter;
      // }
    } else {
      this.filterLoadingInitial();
    }
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
      serverSide: true,
      language: {
        emptyTable: "",
        zeroRecords: ""
      },
      ajax: (dataTablesParameters: any, callback) => {
        if (this.indexSaveBool === true) {
          dataTablesParameters.start = this.indexSave;
        }
        this.indexSave = dataTablesParameters.start;
        this.http
          .post<any>(
            this.apiUrl + '/api/CustomerCardApplication/get-List-by-Service-Center',
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
          title: 'Print Hayya Card',
        },
        {
          title: 'Print Match Pass',
        },
        {
          title: this.translate('ApplicationDate'),
          data: 'applicationDate',
        },

        {
          title: this.translate('FanIDCardStatus'),
          data: 'cardStatus_Name',
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
        // {
        //   title: this.translate('MobileNumber'),
        //   data: 'phone',
        // },
        {
          title: this.translate('ApplicationStatus'),
          data: 'applicationStatus_Name',
        },
        // {
        //   title: this.translate('PrintorIssueCard'),
        //   data: 'printingStatus_Name',
        // },
        // {
        //   title: 'Cancel Print',
        //   data: 'cardStatus_Name',
        // },
        // {
        //   title: this.translate('UpdateStat'),
        //   data: 'cardStatus',
        // },
        {
          title: this.translate('DocumentNumber'),
          data: 'documentIdNo',
        },
        {
          title: this.translate('ApplicationNumber'),
          data: 'applicationNo',
        },
        // {
        //   title: 'Ticket Application Number',
        //   data: 'ticketOrderId',
        // },
        // {
        //   title: this.translate('TicketReferenceNumber'),
        //   data: 'ticketNo',
        // },
        // {
        //   title: this.translate('VoucherCode'),
        //   data: 'voucherCode',
        // },
        // {
        //   title: this.translate('SubmissionType'),
        //   data: 'submissionType_Name',
        // },
        {
          title: this.translate('PrinterName'),
          data: 'printer_Name',
        },

      ],
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },

    }
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  translate(key: string) {
    const translateKey = "CardPickup";
    return this.translateService.instant(translateKey + '.' + key);
  }

  onDocTypeChange() {
    const docType = this.CardPickup.get('doctype')?.value;
    sessionStorage.setItem('CardPickupDocType', docType);
    this.card_pickup_filter = {
      ...this.filter.filter,
      ...this.getCardPickupFilter()
    }
    this.onFilterChange();
  }

  onEventTypeChange() {
    const docType = this.CardPickup.get('eventType')?.value;
    sessionStorage.setItem('CardPickupEventType', docType);
    this.card_pickup_filter = {
      ...this.filter.filter,
      ...this.getCardPickupFilter()
    }
    this.onFilterChange();
  }


  filterColumn() {
    this.normalFilterBoolean = true;
    localStorage.removeItem('DataTables_importdatatable_/main/card-pickup/list');
    const docType = this.CardPickup.get('doctype')?.value;
    sessionStorage.setItem('CardPickupDocType', docType);
    if (this.CardPickup.value.columnName != null ||
      this.CardPickup.value.filterTxt != null){
      sessionStorage.setItem('CardPickupColumnName',this.CardPickup.get('columnName')?.value)
      sessionStorage.setItem('CardPickupFilterTxt',JSON.stringify(this.CardPickup.get('filterTxt')?.value))
    } else {
      sessionStorage.removeItem('CardPickupColumnName');
      sessionStorage.removeItem('CardPickupFilterTxt');
    }
    let filterValue: any;
    this.card_pickup_filter = this.getCardPickupFilter();
    this.filter.filter = this.card_pickup_filter;
    const currentFilter = this.filter.filter ?? {};
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.CardPickup.get('columnName')?.value) {
        if(this.selectedSearchColumnType === SearchType.Text) {
          filterValue = this.CardPickup.get('filterTxt')?.value?.trim();
        }
        else if(filcol.type === SearchType.Select) {
          filterValue = this.CardPickup.get('filterTxt')?.value;
        }

        filterValue = this.CardPickup.get('filterTxt')?.value;
        this.searchTarget = (this.selectedSearchColumnType === SearchType.Text)
          ? {...currentFilter, [filcol.value]: '#' +filterValue + '#' }
          : {...currentFilter, [filcol.value]: filterValue };
      }
    }
    if (this.CardPickup.valid) {
      this.setPaging(true)
      this.onFilterChange();
    }
  }

  action() {
    console.log('view details');
    this.router.navigate(['main/card-pickup/list/view-details']);
  }

  clearFilter() {

    this.normalFilterBoolean = false;
    this.advancedFilterBoolean = false;
    this.indexSaveBool = false;
    sessionStorage.removeItem('CardPickupColumnName');
    sessionStorage.removeItem('CardPickupFilterTxt');
    sessionStorage.removeItem('advCardPickupFilters');
    localStorage.removeItem('DataTables_importdatatable_/main/card-pickup/list');
    const docType = this.CardPickup.get('doctype')?.value;
    const eventType =this.CardPickup.get('eventType')?.value;
    this.CardPickup.reset();
    this.CardPickup.get('doctype')?.setValue(docType);
    this.CardPickup.get('eventType')?.setValue(eventType);

    this.searchTarget = null;
    this.filter = {};
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.card_pickup_filter = this.getCardPickupFilter();
    this.card_pickup_filter =
    this.filter.filter = this.card_pickup_filter;
    this.setPaging(false)
    this.onFilterChange();
  }

  tableShowHide() {
    let result = false;
    if (this.filteredAppdata == undefined || this.filteredAppdata == null) {
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
    if (closeData) {
      console.log('closedata', closeData);
      if (closeData.selectedReason !== 'Update Info') {
        this.replace_confirmation_dialog_open = true;
      } else {
        this.router.navigate(['main/card-replacement/list/edit-details']);
      }
    }
  }

  closeReplacementConfirmation() {
    this.replace_confirmation_dialog_open = false;
  }

  deliverCard() {
    this.closePrintList();
    this.common.header = 'CardPickup.DeliveryCardHeader';
    this.common.body = 'CardPickup.DeliveryCardBody';
    this.showCommonDialogue = true;
  }

  closeCommonDialogue() {
    this.showCommonDialogue = false;
  }

  printCard(event) {
      this.showMultiplePrintList = true;
      const { totatlFailed, totatlSuccess} = event;
          this.subStatus = {
            terminalName:JSON.parse(localStorage.getItem('Terminal')).name,
            printerName:this.printerName,
            succesRecords: totatlSuccess,
            failedRecords: totatlFailed,
            response:event
          };
    // let submitData = {
    //   ApplicationId:event.applicationId,
    //   Reason: 'No Reason',
    //   description: 'Print Card',
    //   reasonType:1
    // };
    //   this.cardReplacementService.CustomerCardPrinting(submitData).subscribe(response=>{

    /******************************************** commented 13 oct 2021
      if(event.length){
        this.common.header = 'CardPickup.PrintCardHeader';
        this.common.body = 'CardPickup.PrintCardBody';
        this.common.fanId ='';
        for(const item of event){
          this.common.fanId = this.common.fanId+" " +item+" "
        }
        this.showCommonDialogue = true;
      }
      *******************************************/
    // },
    // err=>{
    //     this.error_message = err?.error?.message || "Something went wrong!";
    //     this.error_dialog_open = true
    // })
    this.closePrintList();

  }

  showPrintList(fanIdNo) {
    this.fanIdnumber = fanIdNo;
    this.indexSaveBool = true;
    this.reprintBool = false;
    // this.showPrintListDialogue = true;//do after multiple record
    let filter: any = {};
    filter.filter = {fanIdNo: this.fanIdnumber}
    this.cardPickupService.getCardPrintList(filter).subscribe(list=>{
      this.cardPrintList = [];
      let approvedCounter = 0;
      let userData:any;
      let dependentCounter=0;
      let dependentObtainedData:any;
      list.dataList.forEach(item=>{
        if(item.applicationStatus === 2){
          approvedCounter++
          userData = item;

          if(item.cardStatus ===1){
            dependentCounter++;
            dependentObtainedData = item;
          }
        }
      })
      if(list.totalCount === 1 || approvedCounter ===1 || dependentCounter === 1){
        if(list.totalCount === 1){
          userData = list.dataList[0]
        }
        else if(dependentCounter === 1){
          userData = dependentObtainedData
        }
        const dependentObj:any = new Object();
          dependentObj.id = userData?.fanIdNo;
          dependentObj.applicationId = userData?.id;
          this.cardPrintList.push(dependentObj)
          this.showDirectPrintPreview = true;
          this.sendPrintLabel = "Print"
      }
      else{
    this.showPrintListDialogue = true;
      }
    })
  }

  rePrintCard(fanId,appid){
    this.fanIdnumber = fanId;
    this.indexSaveBool = true;
    this.reprintBool = true;
    this.cardPrintList = [];
    const dependentObj:any = new Object();
          dependentObj.id = this.fanIdnumber;
          dependentObj.applicationId = appid;
          this.cardPrintList.push(dependentObj)
          this.sendPrintLabel = "Reprint"
          this.showDirectPrintPreview = true;
  }

  closePrintList() {
    this.showPrintListDialogue = false;
    this.showDirectPrintPreview = false;
    this.onFilterChange();
  }

  closeErrorModel(){
    this.error_dialog_open = false;
  }

  async onFilterChange() {
    const filter = {
      // serivceCenterCode: this.terminalCode, //commented as per requirement on 27 nov 2021
      ...this.card_pickup_filter
    }
    if (this.searchTarget != null) {
      this.filter.filter = Object.assign(filter, this.searchTarget);
    } else {
      this.filter.filter = filter;
    }
    if (this.indexSaveBool) {
      (await this.dtElement.dtInstance).ajax.reload(null, false);
    }
    else {
      this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
        // Destroy the table first
        dtInstance.destroy();
        this.dtTrigger.next();
      });
    }
  }
  // updateCardStatus(fanId,status){
  //   this.fanIdnumber = fanId;
  //   this.updateCardStatusId = status;
  //   this.updateStatusModalOpen = true;
  // }
  closeUpdateStatusDialog(event){
    this.updateStatusModalOpen = false;
    if(event){
      let cardStatusUpdateRequest={
        cardStatusUpdateRequest:event
      };
      this.cardPickupService.updateCardStatusByFanIdNumber(cardStatusUpdateRequest).subscribe(data=>{
        this.indexSaveBool = true;
        this.onFilterChange();
      },err=>{
        this.error_message = err?.error?.message || "Something went wrong!";
        this.error_dialog_open_update_status_failed = true;
      })
    }
  }

  dateFM(date){
    const formattedInitDate = moment(date +'Z');
    const finalDate = formattedInitDate.toLocaleString();
    return new DatePipe('en-Us').transform(finalDate, 'dd-MM-yyyy hh:mm:ss a');
  }

  showImportStatusModal() {
    this.show_import_status_modal = true;
  }

  closeImportStatusModal() {
    this.show_import_status_modal = false;
  }

  onCardImportStatusClose(event) {
    console.log({event});
    const { action, data } = event;
    this.closeImportStatusModal()
    if(action === 'success') {
      console.log({data})
      this.import_status = action;
      this.import_status_data = data;
    } else if(action === 'fail') {
      console.log({err: data})
      this.import_status = action;
      this.import_status_error = data?.error?.message ?? 'Something went wrong!'
    }
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  cancelPrint(id){
    this.cancelPrintId = id;
    this.show_print_cancel_modal = true;
  }

  cancelPrintingQueue(){
    this.show_print_cancel_modal = false;
    const body:CancelPrintRequest ={
      refApplication_Id:this.cancelPrintId,
      status:3,
      updateForFirstRequest:false,
      force:true
    }
    console.log(body)
    this.cardPickupService.cancelPrinting(body).pipe(take(1))
    .subscribe(
      () => {
        this.print_cancel_success = true;
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
        this.print_cancel_error = true;
        this.printCancelErrorMessage = err?.error?.message ?? 'Error';
        this.cd.detectChanges();
      }
    );
  }

  cancelPrintSuccess(){
    this.print_cancel_success = false
    this.indexSaveBool = true;
    this.onFilterChange();
  }

  advancedSearch() {
    sessionStorage.removeItem('advCardPickupFilters');
    this.arrayOffilters = [];
    localStorage.removeItem(
      'DataTables_importdatatable_/main/card-pickup/list'
    );
    this.advancedFilterBoolean = true;
    this.CardPickup.get('filterTxt')?.reset();
    this.CardPickup.get('columnName')?.reset();
    this.filter = {};
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.card_pickup_filter = this.getCardPickupFilter();
    this.filter.filter = this.card_pickup_filter;
    this.setAdvancedSearchFilters();
    this.setPaging(true)
    this.onFilterChange();
  }

  setAdvancedSearchFilters() {
    this.setAdvancedSearchFiltersText();
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('regsc').value)) {
      this.filter.filter[
        'registrationServiceCenterCode'
      ] = this.CardPickup?.get('regsc')?.value;
    }
    if (!this.aps.isNull(this.CardPickup?.get('appstat').value)) {
      this.filter.filter['applicationStatus'] = this.CardPickup?.get(
        'appstat'
      )?.value;
      this.arrayOffilters.push({col:'applicationStatus', value:this.CardPickup?.get('appstat')?.value, controlname:'appstat', hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('fidstat').value)) {
      this.filter.filter['cardStatus'] = this.CardPickup?.get(
        'fidstat'
      )?.value;
      this.arrayOffilters.push({col:'cardStatus', value:this.CardPickup?.get('fidstat')?.value, controlname:'fidstat' ,hashed:false})
    }
    // if (!this.aps.isNullOrEmpty(this.CardPickup?.get('doctype').value)) {
    //   this.filter.filter['docTypeId'] = this.CardPickup?.get(
    //     'doctype'
    //   )?.value;
    //   this.arrayOffilters.push({col:'docTypeId', value:this.CardPickup?.get('doctype')?.value, controlname:'doctype' ,hashed:false})
    // }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('nat').value)) {
      this.filter.filter['nationalityCode'] = this.CardPickup?.get(
        'nat'
      )?.value;
      this.arrayOffilters.push({col:'nationalityCode', value:this.CardPickup?.get('nat')?.value, controlname:'nat' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('appdate').value)) {
      this.filter.filter['applicationDate'] = convertNgbDateToDDMMYYYY(
        this.CardPickup?.get('appdate')?.value
      );
      this.arrayOffilters.push({col:'applicationDate', value:convertNgbDateToDDMMYYYY(this.CardPickup?.get('appdate')?.value), controlname:'appdate' ,hashed:false})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('submitype').value)) {
      this.filter.filter['submissionType'] = this.CardPickup?.get(
        'submitype'
      )?.value;
    }
    if (
      !this.aps.isNullOrEmpty(this.CardPickup?.get('prefcolpoint').value)
    ) {
      this.filter.filter['serivceCenterCode'] = this.CardPickup?.get(
        'prefcolpoint'
      )?.value;
    }

    if (
      !this.aps.isNull(this.CardPickup?.get('accommodationType').value)
    ) {
      this.arrayOffilters.push({col:'accommodationType', value:this.CardPickup?.get('accommodationType')?.value, controlname:'accommodationType' ,hashed:false})
   }

  sessionStorage.setItem("advCardPickupFilters", JSON.stringify(this.arrayOffilters));
    this.setAccommodationFilter();
  }

  setAdvancedSearchFiltersText() {
    // text based filters i.e. #{value}#
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('tktrfcno').value)) {
      this.filter.filter['ticketNo'] =
        '#' + this.CardPickup?.get('tktrfcno')?.value + '#';
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('vochrcod').value)) {
      this.filter.filter['voucherCode'] =
        '#' + this.CardPickup?.get('vochrcod')?.value + '#';
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('ordrid').value)) {
      this.filter.filter['ticketOrderId'] =
        '#' + this.CardPickup?.get('ordrid')?.value + '#';
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('fidno').value)) {
      this.filter.filter['fanIdNo'] =
        '#' + this.CardPickup?.get('fidno')?.value + '#';
         this.arrayOffilters.push({col:'fanIdNo', value:this.CardPickup?.get('fidno')?.value, controlname:'fidno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('appsno').value)) {
      this.filter.filter['applicationNo'] =
        '#' + this.CardPickup?.get('appsno')?.value + '#';
        this.arrayOffilters.push({col:'applicationNo', value:this.CardPickup?.get('appsno')?.value, controlname:'appsno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('docno').value)) {
      this.filter.filter['documentIdNo'] =
        '#' + this.CardPickup?.get('docno')?.value + '#';
        this.arrayOffilters.push({col:'documentIdNo', value:this.CardPickup?.get('docno')?.value, controlname:'docno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('mobno').value)) {
      this.filter.filter['phone'] =
        '#' + this.CardPickup?.get('mobno')?.value + '#';
        this.arrayOffilters.push({col:'phone', value:this.CardPickup?.get('mobno')?.value, controlname:'mobno' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('fname').value)) {
      this.filter.filter['firstName'] =
        '#' + this.CardPickup?.get('fname')?.value + '#';
        this.arrayOffilters.push({col:'firstName', value:this.CardPickup?.get('fname')?.value, controlname:'fname' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('lname').value)) {
      this.filter.filter['lastName'] =
        '#' + this.CardPickup?.get('lname')?.value + '#';
        this.arrayOffilters.push({col:'lastName', value:this.CardPickup?.get('lname')?.value, controlname:'lname' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('derrorcode').value)) {
      this.filter.filter['moiErrorCode'] =
        '#' + this.CardPickup?.get('derrorcode')?.value + '#';
        this.arrayOffilters.push({col:'moiErrorCode', value:this.CardPickup?.get('derrorcode')?.value, controlname:'derrorcode' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('organizationCategory').value)) {
      this.filter.filter['OrganizationCategoryName'] =
        '#' + this.CardPickup?.get('organizationCategory')?.value + '#';
        this.arrayOffilters.push({col:'OrganizationCategoryName', value:this.CardPickup?.get('organizationCategory')?.value, controlname:'organizationCategory' ,hashed:true})
    }
    if (!this.aps.isNullOrEmpty(this.CardPickup?.get('prntrname').value)) {
      this.filter.filter['printer_Name'] =
        '#' + this.CardPickup?.get('prntrname')?.value + '#';
        this.arrayOffilters.push({col:'printer_Name', value:this.CardPickup?.get('prntrname')?.value, controlname:'prntrname' ,hashed:true})
    }
  }

  setAccommodationFilter() {
    const accommodationType = this.CardPickup?.get('accommodationType')?.value;
    const accommodationDate = this.CardPickup?.get('accommodationDate')?.value;
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

  onClearFilter() {
    sessionStorage.removeItem('advCardPickupFilters');
    this.indexSaveBool = false;
    this.arrayOffilters = [];
    const docType = this.CardPickup.get('doctype')?.value;
    this.CardPickup.reset();
    this.CardPickup.get('doctype')?.setValue(docType);
    this.advancedFilterBoolean = false;
    this.selectedSearchColumnType = SearchType.Text;
    this.searchSelectItems$ = of([]);
    this.filter = {};
    this.filter.orderByModel = [{ fieldName: 'System_CreatedOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.card_pickup_filter = this.getCardPickupFilter();
    this.filter.filter = this.card_pickup_filter;
    this.setPaging(false)
    this.onFilterChange();
  }

  getCardPickupFilter() {
    return {
      eventCode: this.CardPickup.get('eventType')?.value,
      docTypeId: this.CardPickup.controls.doctype.value,
      ...(this.isServiceCenter && {
        inAnyApplicationStatus: (this.CardPickup.get('eventType')?.value == 'LSC')?[
          2
        ]:[2],
      })
    };
  }
  clearButton() {
    let result = false;
    if (
      this.CardPickup.value.columnName != null ||
      this.CardPickup.value.filterTxt != null
    ) {
      result = true;
    }
    return result;
  }
  filterLoadingInitial() {
      if(sessionStorage.getItem("advCardPickupFilters")){
        this.advFilterStored = JSON.parse(sessionStorage.getItem("advCardPickupFilters"));
        if(this.advFilterStored){
          this.advancedFilterBoolean = true;
          this.advFilterStored.forEach(item=>{
            if(item.controlname === 'appdate'){
              const ddmmyytommddyy = convertDateDDMMYYYYToMMDDYYYY(item.value)
              this.CardPickup.controls[item.controlname].patchValue(convertDateStringToNgbDate(ddmmyytommddyy));
            }
            else{
              this.CardPickup.controls[item.controlname].patchValue(item.value);
            }
            if(item.hashed){
              this.filter.filter[item.col] =
                '#' + item.value + '#';
            }
            else{
              if(item.controlname === 'accommodationType'){
                this.setAccommodationTypeFilter(item.value)
              }
              else{
              this.filter.filter[item.col] = item.value;
            }
            }
          })
        }
      }
  }

  closePrintCardDialogue(){
    this.showDirectPrintPreview = false;
  }

  showPrintedInitiateDialog(event){
    this.showDirectPrintPreview = false;
    const terminalName = JSON.parse(localStorage.getItem('Terminal')).name
    // this.printSingleSuccessMessage = 'We have generated the request to print Hayya card on' +this.printerName+ 'in Terminal' +terminalName+'. Please collect the card.'
    this.printSingleSuccessMessage = 'The Hayya card print request is sent to printer: '+this.printerName+' on Terminal: '+terminalName
    this.singleSuccessPopup = true;
  }

  closeSuccessSinglePopup(){
    this.singleSuccessPopup = false;
    this.onFilterChange();
  }

  showIssueInitiateDialog(event){
    this.printSingleFailedMessage = event;
    this.showDirectPrintPreview = false;
    this.singleFailedPopup = true;
  }

  closeMultipleSubmissionStatus(){
    this.showMultiplePrintList = false;
    this.onFilterChange();
  }

  singleFailedClose(){
    this.singleFailedPopup = false;
    this.onFilterChange();
  }
   delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}
  public  downloadAsPDF() {


  }
  async printMatchPass(data:any){
    this.spinner.show();


    this.showMatchPass= true;
    if(this.printMatchPassData?.fanIdNo == data?.fanIdNo)
    {
      setTimeout(() => {
        this.openPdf();

    }, 1000);
      this.openPdf();
      //await this.toDataURL(this.cardPickupService.composeUserImageUrl(data.profilePic));
    }
    else{
      this.printMatchPassData = data;
      this.id = Guid.create();
      const payload={
        "fanIdNo": this.printMatchPassData?.fanIdNo ,
        "refTransaction_Id": this.id['value']
      }
      this.cardPickupService.generateMatchPass(payload).subscribe(response=>{

      });
      await this.toDataURL(this.cardPickupService.composeUserImageUrl(data.profilePic));
    }

  }
  async toDataURL(url) {
    const blob = await this.applicantService.getImageBlob(url).toPromise();
    const result = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener("load", function () {
        resolve(reader.result);
      }, false);

      reader.onerror = () => {
        return reject(this);
      };
      reader.readAsDataURL(blob);
    })
    this.printMatchPassImage = result.toLocaleString();
    this.showMatchPass = true;
  }

  openPdf(){
    var data = document.getElementById("matchPass");
    html2canvas(data).then(canvas => {
      var imgWidth = 208;
      var imgHeight = (canvas.height * imgWidth) / canvas.width;
      const contentDataURL = canvas.toDataURL("image/jpeg",0.7);
      let pdf = new jsPDF("p", "mm", "a4"); // A4 size page of PDF
      var position = 0;
      pdf.addImage(contentDataURL, "JPEG", 0, position, imgWidth, imgHeight,undefined,'FAST');
      let x =pdf.output('bloburl');
      this.spinner.hide();
      window.open(x.toString());
      this.showMatchPass=false;
    });
  }

  changeColumn() {
    this.CardPickup.get('filterTxt').patchValue(null);
    this.selectedSearchColumnType = this.getSelectedSearchColumnType()
    this.searchSelectItems$ = this.getSelectedSearchColumn()?.list ?? of([]);
  }
  getSelectedSearchColumnType() {
    return this.getSelectedSearchColumn()?.type ?? SearchType.Text;
  }
  getSelectedSearchColumn() {
    const value = this.CardPickup?.get('columnName')?.value;
    console.log(this.filterColumnsSearch.find((element) => element?.id === value))
    return this.filterColumnsSearch.find((element) => element?.id === value)
  }

  spacetext() {
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && !this.CardPickup.get('filterTxt')?.value.replace(/\s/g, '').length
    ) {
      result = true;
    }
    return result;
  }

  textTypeLength(){
    let result = false;
    if (
      (this.selectedSearchColumnType === SearchType.Text || !this.selectedSearchColumnType) && this.CardPickup.get('filterTxt')?.value.length<3
    ) {
      result = true;
    }
    return result;
  }

  setPaging(state: boolean) {
    this.dtOptions && (this.dtOptions.paging = state);
  }
}
