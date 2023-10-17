import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationUserGetListRequest, OrganizationUserGetListResponseData, UserSendForgotPasswordEmailRequest, AuthService, OrganizationService } from '@fan-id/api/server';
import { FanIDConfig, Environment, ScrollService } from '@fan-id/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';

@Component({
  selector: 'fan-id-organization-users',
  templateUrl: './organization-users.component.html',
  styleUrls: ['./organization-users.component.scss']
})
export class OrganizationUsersComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;

  dtOptions: DataTables.Settings | undefined;
  dtTrigger: Subject<any> = new Subject<any>();

  filter: OrganizationUserGetListRequest = {
    filter: {
      refOrganization_Id: -1
    },
    pageSize: 10,
    orderByModel: [{fieldName: "System_CreatedOn", sortType: 2}]
  };
  organizationUserList: any[] = [];
  resend_password_link_confirm = false;
  resend_password_link_user_data!: OrganizationUserGetListResponseData;
  resend_password_link_success = false;
  resend_password_link_error = false;
  selectedOrganization:any;
  orgId : any;
  permission: any;
  exportPermission: any;
  allPermission: any;
  updatePermission:any
  showManagePopUp=false;
  showSuccessMessageUserInvite=false;
  selectedData: any;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private http: HttpClient,
    private scrollService: ScrollService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private orgService:OrganizationService
  ) { }

  ngOnInit(): void {
    this.getPermission();
    this.getListOrg();
  }
  closeSuccess(){
    this.showSuccessMessageUserInvite = false;
    this.getListOrg();
  }
  getListOrg(){
    this.orgId = (this.route.snapshot.queryParamMap.get('id') ?? -1);
    this.filter.filter = {
      refOrganization_Id: +this.orgId
    }
    this.selectedOrganization = localStorage.getItem('selectedOrganization');
    if(this.filter.filter.refOrganization_Id === -1) {
      this.redirectToOrganizationList();
    }
    else{

    this.orgService.getOrgListbyId(this.filter.filter.refOrganization_Id).subscribe(response=>{
      this.organizationUserList = response?.data ?? [];
      this.organizationUserList.forEach(x=>{
        x['organizationName'] = this.selectedOrganization??"";
        // if(x.userType!=null)
        // x['activated'] = true;
        // else
        // x['activated'] = false;
      });
      this.retriggerdt();
      console.log(this.organizationUserList)
    })
  
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.filter.pageSize ?? 10,
      searching: false,
      ordering: false,
      processing: true,
      info: false,
      lengthChange: false,     
      order: [],
      stateSave: true,
      columnDefs: [
        {
          targets: [
            0,
            1,
            2,
            3,
            4,
            5,
            6


          ],
          orderable: false,
        },
      ],
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };
  }
    // this.dtOptions = {
    //   pagingType: 'full_numbers',
    //   pageLength: this.filter.pageSize ?? 10,
    //   searching: false,
    //   ordering: false,
    //   processing: true,
    //   info: false,
    //   lengthChange: false,
    //   //************** */
    //   serverSide: true,
    //   language: {
    //     emptyTable: '',
    //     zeroRecords: '',
    //   },
    //   ajax: (dataTablesParameters: any, callback) => {
    //     this.http
    //       .get<OrganizationUserGetListResponse>(
    //         this.config.apiUrl + '/api/OrgSignup/getById/'+this.filter.filter.refOrganization_Id)
    //       .pipe(
    //         take(1),
    //         catchError((error) => {
    //           console.log(error);
    //           return of({
    //             dataList: [],
    //             totalCount: 0,
    //           });
    //         })
    //       )
    //       .subscribe((resp) => {


    //         callback({
    //           recordsTotal: resp.totalCount,
    //           recordsFiltered: resp.totalCount,
    //           data: [],
    //         });
    //       });
    //       this.scrollService.scrollToTop();
    //   },
    //   //************** */
    //   columns: [

    //     {
    //       data: 'organizationName',
    //     },
    //     {
    //       data:'firstName',
    //     },
    //     {
    //       data: 'lastName',
    //     },
    //     {
    //       data: 'userName',
    //     },
    //     {
    //       data: 'email',

    //     },
    //     {
    //       data: 'userType',
    //     },
    //     {} //*TODO: add status column
    //   ],
    //   //**************** */
    //   initComplete: function (settings, json) {
    //     $('#organizationuserdatatable').wrap("<div class='fan-id-tablewrap'></div>");
    //   }
    // };
// removed columns
// {
//   data: 'dialingCode',
// },
// {
//   data: 'mobilePhone',
  }
  retriggerdt() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();

      this.dtTrigger.next();
    });
  }
  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  getPermission(){
      const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
      this.permission = permissionList?.roles?.find(
        (element) => element?.key === 'Organisation Signup'
      );

      this.exportPermission = permissionList?.roles?.find((element)=>element?.key ==='Organization Signup Export');
      this.updatePermission = permissionList?.roles.find(element=>element?.key==='UpdateUserMaxApplicantAndVoucherCount');

      this.allPermission = permissionList?.fullAccess;

  }
  getList() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  resendPasswordLink(data: OrganizationUserGetListResponseData) {
    if(!data?.email) {
      this.resend_password_link_error = true;
      return;
    }
    const request: UserSendForgotPasswordEmailRequest = {
      channel: 8,
      email: data.email,
      systemUserName: data.userName,
      systemUserId: data.id,
    }

    this.authService.sendForgotEmail(request)
    .pipe(take(1))
    .subscribe(response => {
      console.log(response);
      this.resend_password_link_success = true;
    }, error => {
      console.log(error);
      this.resend_password_link_error = true;
    })

  }

  gotoPage(page: number) {
    const index = page - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  redirectToOrganizationList() {
    this.router.navigate(['main/organization/all']);
  }

  showResendPasswordLinkConfirm(data: OrganizationUserGetListResponseData) {
    this.resend_password_link_confirm = true;
    this.resend_password_link_user_data = data;
  }

  closeResendPasswordLinkConfirm(e: 'yes' | 'no') {
    this.resend_password_link_confirm = false;
    e === 'yes' && this.resendPasswordLink(this.resend_password_link_user_data);
  }

  export(){
    const today = new DatePipe('en-Us').transform(new Date(), 'dd-MM-yyyy');
    const org = this.organizationUserList[0].organizationName ?? '';
    const body={
      refOrganization_Id: +(this.route.snapshot.queryParamMap.get('id') ?? -1)
    }
    this.generateExcel(body)
    .pipe(take(1))
    .subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const linkText = document.createTextNode("Download File");
      const filename = `${org}_users_${today}.xlsx`
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

  generateExcel(body: any) {
    const url = this.config.apiUrl + '/api/OrgSignup/viewDetailsExcel/' + this.orgId;
    return this.http.get(url, { responseType: 'blob' });
  }
  resendUserInvite(body:any){
   const payload ={
     id:body?.refSystemUserInvitation_Id
   }

   this.orgService.resendUserInvite(payload).subscribe(response=>{
   this.resend_password_link_success =true;

   },error=>{
    this.resend_password_link_error=true;
   });
  }
  editUserMaxCounts(data:any){
    this.showManagePopUp=true;
    this.selectedData = data;
  }
  showSuccessUserInfo(){
    this.showManagePopUp=false;
    this.showSuccessMessageUserInvite = true;
  }
}