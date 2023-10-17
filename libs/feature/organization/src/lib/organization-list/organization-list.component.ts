import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IVoucherCategoryListItem, OrganizationGetListRequest, OrganizationGetListResponse, OrganizationGetListResponseData, OrganizationService, VoucherService } from '@fan-id/api/server';
import { Environment, FanIDConfig, ScrollService } from '@fan-id/core';
import { DataTableDirective } from 'angular-datatables';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, shareReplay, take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings | undefined;
  dtTrigger: Subject<any> = new Subject<any>();

  filter: OrganizationGetListRequest = {
    pageSize: 10,
    orderByModel: [{fieldName: "System_CreatedOn", sortType: 2}]
  };
  organizationList: OrganizationGetListResponseData[] = []
  showOrganizationPopUp = false;
  showOrganizationSuccessPopUp=false;
  showOrganizationSuccessPopUp1 = false;
  showOrganizationResendPopUp=false;
  showInvite = false;
  permission :any;
  accessGroup = localStorage.getItem('accessGroupName');
  showManagePopUp = false;
  selectedOrg: any;
  showSuccessMessageUserInvite=false;
  isEdit =false;
  isEditData: any;
  eventName = localStorage.getItem('event');
  displayEventName =localStorage.getItem('displayEvent');
  innerFilter:any;
  search = new FormGroup({
    columnName: new FormControl(null, Validators.required),
    filterTxt: new FormControl(null, Validators.required),
  });
  filterOptions = [
    {
      key:  "statusValue",
      text: "Activation Status",
      type: "select",
    },
    {
      key:  "name",
      text: "Organization Name",
    },
    {
      key:  "contactName",
      text: "Organization Admin Name",
    },
    {
      key:  "organizationCategory",
      text: "Organization Category",
    },
    {
      key:  "isVoucherGenerationEnabled",
      text: "Voucher Management",
      type: "select",
    },
    {
      key:  "email",
      text: "Organization Admin Email ID",
    },
    {
      key:  "requesterEmailId",
      text: "Requester Email",
    },
    {
      key:  "phoneNumber",
      text: "Mobile Number",
    },
    {
      key:"countryName",
      text:"Organization Country"
    },
    {
      key:  "addressLine1",
      text: "Organization Addresss",
    },
    {
      key:  "refVoucherCategory_Id",
      text: "Voucher Category",
      type: "select",
    }
  ]
  filterSelectOptionKeys = this.filterOptions
    .filter((item) => item.type === 'select')
    .map((item) => item.key);
  activationStatus = [
    {
      id: 1,
      name: "Inactive"
    },
    {
      id: 2,
      name: "Active"
    }
  ]
  voucherStatus = [
    {
      id: true,
      name: "Yes"
    },
    {
      id: false,
      name: "No"
    },
  ]
  voucherCategoryList$!: Observable<IVoucherCategoryListItem[]>
  invitePermission: any;
  allPermission: any;
  exportPermission: any;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
    private scrollService: ScrollService,
    private orgService: OrganizationService,
    private voucherService: VoucherService
  ) { }

  ngOnInit(): void {
    this.getPermission();
    this.dtOptions = {
      stateSave: true,
      pagingType: 'full_numbers',
      pageLength: this.filter.pageSize ?? 10,
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
        this.http
          .post<OrganizationGetListResponse>(
            this.config.apiUrl + '/api/OrgSignup/getOrganisationListWithSignup',
            {
              ...this.filter,
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

            this.organizationList = resp?.dataList ?? [];

            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
          this.scrollService.scrollToTop();
      },
      //************** */
      columns: [
        {},
        {
          data: 'name',
        },
        {
          data: 'contactName',
        },
        {
          data: 'email',
        },
        {
          data: 'phoneAreaCode',
        },
        {
          data: 'phoneNumber',
        },
        {
          data: 'description',
        },
      ],
      //**************** */
      initComplete: function (settings, json) {
        $('#organizationdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      }
    };
  }

  changeColumn() {
    this.search.controls.filterTxt.patchValue(null);
  }

  clearFilter(){
    localStorage.removeItem('DataTables_organizationdatatable_/main/organization/all');
    this.search.patchValue({
      columnName:null,
      filterTxt:null
    })
    this.filter.filter = {};
    this.getList();
    sessionStorage?.removeItem('orgColumnName');
    sessionStorage?.removeItem('orgFilterTxt');
  }

  clearButton(){
    let result = false;
    if (
      this.search.value.columnName != null ||
      this.search.value.filterTxt != null
    ) {
      result = true;
    }
    return result;
  }

  filterColumn() {
    localStorage.removeItem('DataTables_organizationdatatable_/main/organization/all');
    const columnName = this.search.get('columnName')?.value;
    const filterTxt = this.search.get('filterTxt')?.value;
    let searchValue = "";
    if(!this.filterSelectOptionKeys.includes(columnName)) {
      searchValue = '#' + filterTxt +'#';
    } else {
      searchValue = filterTxt;
    }
    this.innerFilter = {};
    this.innerFilter[columnName] = searchValue;
    this.filter['filter'] = this.innerFilter;
    sessionStorage?.setItem('orgColumnName',columnName);
    sessionStorage?.setItem('orgFilterTxt', filterTxt);
    this.getList();
  }

  getPermission() {
    const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
    this.permission = permissionList?.roles?.find(
      (element) => element?.key === 'Organisation Signup'
    );
    if( this.permission && this.permission?.value?.create){
      this.showInvite = true;
    }
    else{
      this.showInvite = false;
    }
    this.invitePermission = permissionList?.roles?.find((element)=>element?.key ==='Invite user');
    this.exportPermission = permissionList?.roles?.find((element)=>element?.key ==='Organization Signup Export');
    this.allPermission = permissionList?.fullAccess;
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getList() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  closeInviteUser(){
    this.showOrganizationPopUp=false;
    this.showOrganizationSuccessPopUp1 = false;
    this.isEdit = false;
  }

  export(){
    const today = new DatePipe('en-Us').transform(new Date(), 'dd-MM-yyyy');
    this.generateExcel({})
    .pipe(take(1))
    .subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const linkText = document.createTextNode("Download File");
      const filename = `organizationlist_${today}.xlsx`
      a.appendChild(linkText);
      a.setAttribute('download',filename);
      a.href = url;
      a.click();
      a.remove();
    }, err => {
      console.log({err});
      alert('Something went wrong!');
    })
  }

  setCache(data:any){
    localStorage.setItem("selectedOrganization",data.name);
  }

  generateExcel(body: any) {
    const url = this.config.apiUrl + '/api/OrgSignup/getOrganisationListWithSignupExcel';
    return this.http.post(url, body, { responseType: 'blob' });
  }

  onboardRefresh() {
    this.showOrganizationPopUp = false;
    if (this.isEdit) {
      this.showOrganizationSuccessPopUp1 = true;
    }
    else {
      this.showOrganizationSuccessPopUp = true;
    }
    this.isEdit = false;
  }

  refreshOrganization(){
    this.showOrganizationSuccessPopUp=false;
    this.showOrganizationSuccessPopUp1 = false;
    this.getList();
  }

  resendOrganizationInvite(data:any){
    const payload={
      id: data?.signupId
    }
    this.orgService.resendOrganizationInvite(payload).subscribe(response=>{
    this.showOrganizationSuccessPopUp=true;

    },error=>{
      this.showOrganizationResendPopUp = true;
    });
  }

  downloadOrgTemplate(){
    this.orgService.downloadTemplate().subscribe(response=>{
      const filetype ={ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' };
      const file = new Blob([response], filetype)
      const fileURL = URL.createObjectURL(file);
      const a         = document.createElement('a');
      a.href        = fileURL;
      a.target      = '_blank';
      a.download    =  'Organization_Provisioning_Template.xlsx';
      document.body.appendChild(a);
      a.click();
    })
  }

  managerUser(data:any){
    this.selectedOrg = data.id;
    this.showManagePopUp=true;
  }

  editUser(data:any){
    this.isEdit = true;
    this.showOrganizationPopUp =true
    this.isEditData = data;
  }

  showSuccessUserInfo(){
    this.showManagePopUp=false;
    this.showSuccessMessageUserInvite = true;
  }
}
