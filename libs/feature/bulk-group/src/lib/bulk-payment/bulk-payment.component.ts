  

import { ActivatedRoute, Router } from '@angular/router';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  columnName,
  BulkRegistrationDraftGetListRequestPagingRequest,
  ApplicantService,
  AllApplicationsService,
  CancelApplication,
  USERS_WITH_VIP_PRIVILEGE,
  TournamentType,
  FANID_CATEGORY_VIP,
} from '@fan-id/api/server';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { catchError, first, take } from 'rxjs/operators';
import { DataTableDirective } from 'angular-datatables';
import { Environment, FanIDConfig, MenuService } from '@fan-id/core';
import { HttpClient } from '@angular/common/http';
import { downloadFile } from '@fan-id/shared/utils/common';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
import { BulkRegistrationService, MetadataService, PackageUploadService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-bulk-payment',
  templateUrl: './bulk-payment.component.html',
  styleUrls: ['./bulk-payment.component.scss']
})
export class BulkPaymentComponent implements OnInit,AfterViewInit,OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  columns: columnName[];
  filteredAppdata: any = [];

  dtOptions: DataTables.Settings = {};

  dtTrigger: Subject<any> = new Subject<any>();

  allApplication = new FormGroup({
    columnName: new FormControl(),
    filterTxt: new FormControl(),
  });
  filterColumnsSearch = [
    {
      id: 1,
      name: 'Application Number',
      value: 'applicationNo',
    },
   
    {
      id: 3,
      name: 'Hayya Card Status',
      value: 'cardStatus_Name', // not received yet
    },
    {
      id: 4,
      name: 'Entry Reference Number',
      value: 'fanIdNo',
    },
    {
      id: 5,
      name: 'Document Name',
      value: 'docType_Name',
    },
    {
      id: 6,
      name: 'Document Number',
      value: 'documentIdNo',
    },
    {
      id: 7,
      name: 'Nationality',
      value: 'nationality_Name',
    },
    {
      id: 8,
      name: 'First Name',
      value: 'firstName',
    },
    {
      id: 9,
      name: 'Last Name',
      value: 'lastName',
    },

    {
      id: 11,
      name: 'Application Date',
      value: 'applicationDate',
    },
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
      id: 12,
      name: this.translate('SubmissionType'),
      value: 'submissionType_Name',
    },
    {
      id: 18,
      name: 'Email ID',
      value: 'email',
    }
  ];
  filterColumnsAgent = [
    {
      id: 20,
      name: 'Organization Name',
      value: 'organization_Name',
    },
  ];
  bulkgroupName = '';
  importListTemp: any = [];
  eventCode:string;
  importeddata: any = [];
  listRequest: BulkRegistrationDraftGetListRequestPagingRequest;
  organizationId = 0;
  organizationName: string;
  eventName: string;
  displayEventName;

  isUserAgent: boolean;
  type = '';
  showBulkCancelPopUp = false;
  fanIdNumber: string;
  fanId:number;
  documentNumber: string;
  isSubmitEnabled = false;
  show_cancel_application_modal = false;
  cancel_application_success = false;
  cancel_application_error = false;
  cancel_application_error_message: string;
  checkedIds: number[] = [];
  selectAllChecked = false;
  bulkGroupName = '';
  uncheckedIds: number[] = [];
  delete_draft_data: any;
  show_delete_draft_modal = false;
  delete_draft_success = false;
  delete_draft_error = false;
  delete_draft_error_message: string;
  permission:any;
  allPermission:any;
  totalApplicationCount = 0;
  showDeleteStatus = false;
  exportPermission: any;
  isDeleteEnable = false;
  submitSuccess = false;
  submitError = false;
  backUrl = 'main/bulk-groups/step-1';
  
  dtProcessing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  bulkPackageData = {
    BulkGroupName: '',
    RefEvent_Code: '',
    RefOrganization_Id: '',
    RefRegUserCategory_Code: '',
    RefApplicationType_Code: ''
  };
  @ViewChildren("checkboxes")
  checkboxes!: QueryList<ElementRef>;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
    private router: Router,
    private packageUploadService: PackageUploadService,
    private route: ActivatedRoute,
    private applicantService: ApplicantService,
    private menuService: MenuService,
    
    private allApplicationService: AllApplicationsService,
    private translateService: TranslateService,
  ) {
    this.isUserAgent = this.menuService.isUserTypeAgent;
  }
  
  selectPayment(event: any, data: any) {
    const checked = event.target.checked;
    const id = data.fanIdNo;
    if (checked) {
      
      this.uncheckedIds.splice(this.uncheckedIds.indexOf(id), 1);
      if (!this.selectAllChecked)
       
        this.checkedIds.push(id);
    } else {
      this.checkedIds.splice(this.checkedIds.indexOf(id), 1);
      if (this.selectAllChecked)
        this.uncheckedIds.push(id);
    }
    this.setSubmitDeleteState();
  }
  private isApplicationChecked(id: number) {
    if (!this.selectAllChecked) {
      return this.checkedIds.indexOf(id) >= 0 ? true : false;
    } else {
      return this.uncheckedIds.indexOf(id) >= 0 ? false : true;
    }
  }


   
   

  setSubmitDeleteState() {
     
    this.selectAllChecked = 
      this.selectAllChecked ? this.uncheckedIds.length !== this.totalApplicationCount : false;
    this.isSubmitEnabled = this.checkedIds.length > 0 || this.selectAllChecked;
    this.isDeleteEnable = this.checkedIds.length > 0 || this.selectAllChecked;
  }
  getpermission(){
     const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
        this.permission = permissionList?.roles?.find(
          (element) => element?.key === 'Customer Application'
        );
        this.exportPermission = permissionList?.roles?.find(
          (element) => element?.key === 'Export Applications'
        );
        this.allPermission = permissionList?.fullAccess;


  }
  ngOnInit(): void {
    this.getpermission();
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.eventCode = localStorage.getItem('eventCode');
    this.fanId= +this.route.snapshot.queryParamMap.get('fanIdNo');
    this.organizationId = +this.route.snapshot.queryParamMap.get('organizationId');
    this.organizationName = this.route.snapshot.queryParamMap.get('organizationName');
    this.bulkgroupName = this.route.snapshot.queryParamMap.get('bulkGroupName');
    
    this.listRequest = {
      filter: {
        bulkGroupName: this.bulkgroupName,
        refEvent_Code: this.eventCode,
        refOrganization_Id: this.organizationId,
         
       // applicationStatus: 10

      },
      // orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }], // not working, error
      pageIndex: 0,
      pageSize: 10,

      countRequired: true,
    };
    
    
   
    this.columns = this.filterColumnsSearch;
    //   });
    this.dtOptions = {
      paging: true,
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
        this.http
          .post<any>(
            this.config.apiUrl +
              '/api/BulkRegistrationDraft/get-List',
            {
              ...this.listRequest,
              pageIndex:
                dataTablesParameters.start / dataTablesParameters.length,
            }
          )
          .pipe(
            take(1),
            catchError((error) => {
              console.log(error);
              return of({
                dataList: [],
                totalCount: 0,
              });
            })
          )
          .subscribe((resp) => {
            if (resp.dataList) {
              this.filteredAppdata = resp.dataList;
            }
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
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
          data: 'regUserCategory_Name',
        },
        {
          data: 'firstName',
        },
        {
          data: 'lastName',
        },
        {
          data: 'docType_Name',
        },
        {
          data: 'documentIdNo',
        },
        {
          data: 'bulkGroupName',
        },
        {
          data: 'organization_Name',
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
        {
          data: 'email',
        },
      ],
      //************************************* */
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
      preDrawCallback: () => {
        this.dtProcessing$.next(true);
      },
      drawCallback: () => {
        this.dtProcessing$.next(false);
      }
    };
    // this.getApplicationsList()
    // this.getList();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }
  request = {
    filter: {
      bulkGroupName: '',
      refEvent_Code: '',
      refOrganization_Id: '',
      isBulkRegistrationDraft: false,
      filterType_Package: 0
    },
    pageIndex: 0,
    pageSize: 10,
    countRequired: true,
  }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  public filterColumn() {
    let filterValue: any;
    for (const filcol of this.filterColumnsSearch) {
      if (filcol.id == this.allApplication.get('columnName')?.value) {
        // if(this.allApplication.get('columnName')?.value == 11){
        //   filterValue = this.allApplication.get('filterTxt')?.value.toISOString()
        // }
        // else{
        filterValue = this.allApplication.get('filterTxt')?.value;
        // Object.assign(filter, this.searchTarget);
        // }
        this.listRequest.filter[filcol.value] =  '#' + filterValue + '#' ;
      }
    }
    if (this.allApplication.valid) {
        this.setPaging(true);
      this.getList()
    }
  }
   
  onSubmit() {
    
    const data = this.checkedIds;
    
    const body =  {
      fanIdNo:  data,
      refOrganization_Id: this.organizationId,
      bulkGroupName: this.bulkgroupName,
      totalApplication : this.checkedIds.length
    }
    console.log(body);
     
    this.router.navigate(['main', 'payments', 'bulk-create-order'], {
     
     
     state: { body},
     
    });
    

  }
  checkAll1(event:any)
  {
  
   const count=0;
 
    this.checkboxes.forEach((element) => {
      if(event.target.checked){
      element.nativeElement.checked = true;
     
      this.isSubmitEnabled = true;   
    } else {
      element.nativeElement.checked = false;
      this.isDeleteEnable = false;
      this.isSubmitEnabled = false;
      
    }  
      this.isDeleteEnable = true;
      }   
     
    )
    if(event.target.checked)
    for (const item of this.filteredAppdata) {
      this.checkedIds.push(item.fanIdNo);
  
    }
    else{
      for (const item of this.filteredAppdata) {
      const index = this.checkedIds.indexOf(
        item.fanIdNo
        );
        if (index > -1) {
          this.checkedIds.splice(index, 1);
        }
      }
     
    }
     
     
     
  }

  checkAction(type: string, data: any) {
    const {
      applicationStatus: _as,
      cardStatus: _cs,
      printingStatus: _ps,
      isChildApplication: _ca, // boolean
      customerCategoryCode,
      docTypeId: _dt
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
        return _as === 2 && _cs === 5;
      case 'Card Malfunctioning':
        return _as === 2 && _cs === 5;
      case 'Re-Submit':
        return _as === 3 && _cs === 1;
      case 'Update Info':
        return (
          [2, 3, 4].includes(_as) &&
          !((_as === 2 || _as === 7) && _dt === 1) &&
          !(_cs === 1 && _ps === 2) &&
          (!isCustomerVIP ? true : loggedInUserHasVIPPrivilege)
        );
      case 'Add Dependent':
        return (
          !_ca && eventTournamentType !== 1 && _as !== 0
        ); //&& dependentCount < MAX_DEPENDENT_COUNT;
      case 'Cancel':
        return _as !== 6 && _as !== 0;
      case 'Re-Apply':
        return _as === 6;
      case 'Edit':
        return false;
      case 'Delete':
        return false;
      default:
        return false;
    }
  }

  action(action,fanid,id,isDraft) {
    if (action) {
      if (action === 'Update Info') {
        if(isDraft) {
          this.router.navigate([
            'main/bulk-groups/edit',
          ],{
            queryParams: { id,feature:'BulkGroupstep2' }
          });
        } else {
          this.router.navigate( ['main/all-applications/list/applicant-details/edit'],
          {
            queryParams: {
              submitReasonType: 3, fanid, from: this.bulkgroupName,
              organizationId: this.organizationId, organizationName: this.organizationName
             },
          }
          )
        }
      } else if (action === 'Re-Submit') {
        this.router.navigate(
          ['main/all-applications/list/applicant-details/edit'],
          {
            queryParams: {
              submitReasonType: 2, fanid, from: this.bulkgroupName,
              organizationId: this.organizationId, organizationName: this.organizationName
             }
          }
        );
      } else if (action === 'Add Dependent') {
        this.router.navigate(['main/bulk-registration/manual-registration/new-application'], {
          queryParams: { parentfanid: fanid },
        });
      } else {
        this.router.navigate(['main/all-applications/list/applicant-details'], {
          queryParams: { action,fanid,from:this.bulkgroupName },
        });
      }
    } else {
      if(!isDraft) {
        this.router.navigate(['main/all-applications/list/applicant-details'], {
          queryParams: { fanid, from:this.bulkgroupName },
        });
      } else {
        this.router.navigate(['main/bulk-groups/bulk-group-application-details'],{
          queryParams: { id, from:this.bulkgroupName },
        });
      }
    }
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

  clearFilter() {
    this.allApplication.reset();
    this.listRequest = {
      filter: {
        bulkGroupName: this.bulkgroupName,
        refEvent_Code: this.eventCode,
        refOrganization_Id: +this.organizationId,
      },
      // orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }], // not working, error
      pageIndex: 0,
      pageSize: 10,
      countRequired: true,
    };
    this.setPaging(false);
    this.getList()
  }

  getApplicationsList(){
    this.applicantService.getBulkRegistrationDraftList(this.listRequest)
    .pipe(first())
    .subscribe(
      (response) => {
        this.filteredAppdata = response?.dataList ?? [];
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
          // Destroy the table first
          dtInstance.destroy();
          this.dtTrigger.next();
        });
      },
      (error) => console.error(error)
    );
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  generateExcel() {
    const payload = {
      filter: {
        bulkGroupName: this.bulkgroupName,
        refEvent_Code: this.eventCode,
        refOrganization_Id: this.organizationId,
      }
    }

    this.applicantService.generateExcelDraftList(payload)
    .pipe(take(1))
    .subscribe(data => {
      const filename = `CardApplications_${this.bulkgroupName}.xlsx`
      const type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      downloadFile({data, filename, type});
    }, err => {
      console.log({err});
      alert('Something went wrong!');
    })
  }

  getList() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  showCancelApplicationModal(fanIDNo,documentIdNo) {
    this.fanIdNumber = fanIDNo;
    this.documentNumber = documentIdNo;
    this.show_cancel_application_modal = true;
  }
  cancel() {
    
    this.showBulkCancelPopUp = false;
    this.router.navigate([this.backUrl]);
  }
  cancelApplication() {
     
    this.show_cancel_application_modal = false;
    const body: CancelApplication = {
      fanIDNo: this.fanIdNumber,
      documentIdNo: this.documentNumber
    }
    console.log(body)
    this.allApplicationService.cancelApplication(body).pipe(take(1)).subscribe(
      () => {
        this.cancel_application_success = true;
      },
      (err) => {
        this.cancel_application_error = true;
        this.cancel_application_error_message = err?.error?.message ?? 'Error';
      }
    )
  }

  cancelApplicationSuccess() {
    this.cancel_application_success = false
    this.getApplicationsList();
  }

  showDeleteDraftModal(data: any) {
    this.delete_draft_data = data;
    this.show_delete_draft_modal = true;
  }

  closeDeleteDraftModal(e: 'yes' | 'no') {
    this.show_delete_draft_modal = false;
    e === 'yes' && this.deleteDraft();
  }

  deleteDraft() {
    const { id, system_RowVersion } = this.delete_draft_data;
    this.applicantService.deleteApplicantFromBulkDraft({ id, system_RowVersion })
      .pipe(take(1))
      .subscribe(response => {
        console.log({ response });
        this.delete_draft_success = true;
        this.getApplicationsList();
      },
      error => {
        console.log('delete applicant', {error});
        this.delete_draft_error = true;
      })
  }
  
  translate(key: string) {
    const translateKey = 'AllApplicantsList';
    return this.translateService.instant(translateKey + '.' + key);
  }
  dateFM(date) {
    const formattedInitDate = moment(date + 'Z');
    const finalDate = formattedInitDate.toLocaleString();
    return new DatePipe('en-Us').transform(finalDate, 'dd-MM-yyyy hh:mm:ss a');
  }

  setPaging(state: boolean) {
    this.dtOptions && (this.dtOptions.paging = state);
  }
}
