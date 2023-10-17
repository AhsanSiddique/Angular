import { Component, OnInit, OnDestroy, Inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BulkGroupService,
  IVoucherCategoryListItem,
  VoucherExcelData,
  VoucherService
} from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { Observable, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Environment, FanIDConfig, ScrollService } from '@fan-id/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { onUniqueFieldFocus } from '@fan-id/shared/utils/form';
import { catchError, filter, map, startWith, switchMap, tap } from 'rxjs/operators';

const EmailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
enum SearchType {
  Text = 1,
  Select = 3
}
interface IFilterItem {
  id: number;
  name: string;
  value: string;
  searchType: SearchType;
}
@Component({
  selector: 'fan-id-generate-voucher-code',
  templateUrl: './generate-voucher-code.component.html',
  styleUrls: ['./generate-voucher-code.component.scss']
})
export class GenerateVoucherCodeComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement!: DataTableDirective;
  dtOptions: DataTables.Settings | undefined;
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild('download', { static: true })
  downloadExcel!: ElementRef;
  updateEmailBoolean = false
  file: File;
  organizations: any[] = [];
  bulkgroups = [];
  voucherStats: any;
  filter: any = {};
  bulkgroupdata: any[] = [];
  fileType: any = '';
  vGroupMaskPattern = { 'S': { pattern: /[a-zA-ZÀ-ÿ0-9 ]/ } };


  voucherSearchFilter!: FormGroup;
  pageConfig: any = {
    id: 'BulkGroupPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  eventName: string | undefined;
  displayEventName;

  userOrganizationId = 0;
  userOrganizationCode = '';
  eventCode: string | undefined;
  private apiUrl: string;
  bulkGroupName = null
  numberofapplication: string;
  excelfailBool = false;
  generatefailBool = false;
  error_message = '';
  indexSave = 0;
  isUserAgent: boolean;
  generateSuccess = false;
  generateExcelSuccess = false;
  openDownloadDialogBoolean = false;
  excelDownloadType = 0;
  disableRadio = false;
  accessGroup = localStorage.getItem('accessGroupName');
  allPermission: any;
  resendPermission: any;
  updateEmailData: any;
  updateEmailSuccessBoolean = false;
  updateEmailFailedBoolean = false;
  updateEmailFailedMessage = '';
  filterSelectionItems: IFilterItem[] = [
    {
      id: 1,
      name: this.translate('VoucherCode'),
      value: 'voucherCode',
      searchType: SearchType.Text
    },
    {
      id: 2,
      name: this.translate('VoucherStatus'),
      value: 'voucherStatus',
      searchType: SearchType.Select
    },
    {
      id: 3,
      name: this.translate('OrganizationName'),
      value: 'organization_Name',
      searchType: SearchType.Select
    },
    {
      id: 5,
      name: 'Voucher Group Name',
      value: 'BulkVoucherGroupName',
      searchType: SearchType.Text
    },
    {
      id: 4,
      name: 'Email ID',
      value: 'email',
      searchType: SearchType.Text
    },
    {
      id: 6,
      name: 'Voucher Category',
      value: 'refVoucherCategory_Id',
      searchType: SearchType.Select
    },
    {
      id: 7,
      name: 'Voucher Type',
      value: 'voucherCodeType',
      searchType: SearchType.Select
    }
  ]
  voucherStatisticsArray = [
    {
      id: 1,
      name: 'Valid',
      value: 'Valid'
    },
    {
      id: 2,
      name: 'Applied',
      value: 'Invalid',
    },
  ]
  ststBody: any;
  export1Permission: any;
  export2Permission: any;
  voucherCodeGenerateForm!: FormGroup;
  excelUploadStatus: any;
  resendVoucherNotificationSuccess = false;
  resendVoucherNotificationFailure = false;
  resendVoucherNotificationErrMsg = '';
  voucherGroupList: any = [];
  isNewGroupName = true;
  onUniqueFieldFocus = onUniqueFieldFocus;
  selectedFilterItem$!: Observable<IFilterItem | undefined>
  voucherCategoryList$!: Observable<IVoucherCategoryListItem[]>
  isFilterTextEmpty$!: Observable<boolean>
  voucherTypeList!: { value: number, name: string }[];
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private bulkGroupService: BulkGroupService,
    private http: HttpClient,
    private fb: FormBuilder,
    private voucherService: VoucherService,
    private translateService: TranslateService,
    private scrollService: ScrollService,
    public datepipe: DatePipe,
  ) {
    this.apiUrl = this.config.apiUrl;
    if (this.accessGroup === "B2B_Org_Admin") {
      this.isUserAgent = false;
    } else if (this.accessGroup === "B2B_Company_Rep") {
      this.isUserAgent = false;
    } else {
      this.isUserAgent = true;
    }

    this.voucherSearchFilter = this.fb.group({
      columnName: [null, Validators.required],
      filterTxt: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getPermission();
    this.voucherCodeGenerateForm = this.fb.group({
      vGroup: ['vgroupnew'],
      vGroupName: [null, [Validators.required]],
      vType: ['vassigned'],
      vgMode: ['single'],
      emailId: [null, [Validators.required, Validators.pattern(EmailRegex)]],
      uploadzipfile: [null,],
      organizationname: [null],
      numberofapplication: [
        null,
        [
          Validators.required,
          Validators.pattern("^[1-9]{1}[0-9]*$"),
          Validators.min(1),
        ],
      ],
    })
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
    this.eventCode = localStorage.getItem('eventCode');
    this.userOrganizationId = parseInt(localStorage.getItem('organizationId'));
    this.userOrganizationCode = localStorage.getItem('organizationCode')
    this.voucherCodeGenerateForm.get('organizationname')?.patchValue(this.userOrganizationId);
    this.ststBody = {
      organizationId: this.userOrganizationId
    }
    this.selectedFilterItem$ = this.vsf.columnName.valueChanges.pipe(
      startWith(this.vsf.columnName.value),
      map(columnId => this.filterSelectionItems.find(item => item.id === columnId))
    )
    this.filter.filter = {
      ...(!this.isUserAgent ? { organizationId: this.userOrganizationCode } : null),
    }
    this.filter.orderByModel = [{ fieldName: 'voucherUserOn', sortType: 2 }];
    this.filter.pageSize = this.pageConfig.itemsPerPage;
    this.filter.countRequired = true;
    this.dtOptions = {
      // select:'multiple',
      // displayStart:this.displayStart,
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
        this.http
          .post<any>(
            this.config.apiUrl + '/api/FifaFanIdVoucher/getListByOrganizationId',
            {
              ...this.filter,
              pageIndex:
                dataTablesParameters.start / dataTablesParameters.length,
            }
          )
          .subscribe((resp) => {
            callback({
              recordsTotal: resp.totalCount,
              recordsFiltered: resp.totalCount,
              data: [],
            });
          });
        this.scrollService.scrollToTop();
      },
      columns: [
        { title: 'Action' },
        // {
        //   title: this.translate('SrNo'),
        // },
        {
          title: this.translate('CreatedDate'),
          data: 'system_CreatedOn',
        },
        ...(!this.isUserAgent ? [] : [{
          data: 'organization_Name',
        }]),
        {
          data: 'bulkGroupName'
        },
        {
          title: this.translate('VoucherStatus'),
          data: 'voucherStatus'
        },
        {
          title: this.translate('VoucherCode'),
          data: 'voucherCode',
        },
        {
          data: 'email'
        }

      ],
      //**************** */
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    }

    if (this.isUserAgent) {
      this.getVoucherStat({});
    } else {
      this.getVoucherStat(this.ststBody);
      this.voucherGroupNameList();
    }
    this.getDropdownData();
    this.isFilterTextEmpty$ = this.vsf.filterTxt.valueChanges.pipe(
      startWith(this.vsf.filterTxt.value),
      map(filterText => {
        const columnId = this.vsf.columnName.value;
        const column = this.filterSelectionItems.find(item => item.id === columnId);
        const searchType = column ? column.searchType : SearchType.Text;
        if (searchType === SearchType.Text) {
          return filterText ? !filterText.trim().length : true;
        }
        return false;
      })
    )
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  getPermission() {
    const permissionList = JSON.parse(localStorage.getItem('PermissionList'));

    this.resendPermission = permissionList?.roles?.find(
      (element) => element?.key === 'Resend Voucher Notification'
    );
    this.export1Permission = permissionList?.roles?.find(
      (element) => element?.key === 'Generate Voucher'
    );
    this.export2Permission = permissionList?.roles?.find(
      (element) => element?.key === 'Export Applications With Voucher code and Orgnaization Details'
    );
    this.allPermission = permissionList?.fullAccess;
  }

  getDropdownData() {
    this.bulkGroupService.getOrganizations()
    .subscribe(response => {
      this.organizations = response?.dataList ?? []
    }, err => {
      console.log(err)
    })

    this.voucherCategoryList$ = this.voucherService.getVoucherCategoryList().pipe(
      map((response) => {
        return response?.dataList ?? [];
      }),
      catchError((err) => {
        console.log(err);
        return of([]);
      })
    )

    this.voucherTypeList = [
      { value: 1, name: 'Assigned' },
      { value: 2, name: 'Unassigned' }
    ]
  }

  public generateVouchers() {
    let orgId: any;
    this.organizations.forEach(item => {
      if (this.voucherCodeGenerateForm.get("organizationname")?.value === item.id) {
        orgId = item.organizationId
      }
    })
    let body = {
    }
    if (this.voucherCodeGenerateForm.controls.vType.value === 'vassigned') {
      if (this.voucherCodeGenerateForm.controls.vgMode.value === 'single') {
        body = {
          organizationId: orgId,
          voucherCodeType: 1,
          voucherCodeGeneration: 1,
          email: this.voucherCodeGenerateForm.controls.emailId.value,
          eventCode: this.eventCode,
          bulkGroupName: this.voucherCodeGenerateForm.controls.vGroupName?.value.trim(),
          isNewGroupName: this.isNewGroupName
        }
        this.voucherService.generateAssignedSingleVoucher(body).subscribe(vouchers => {
          if (vouchers?.status === 200) {
            this.generateSuccess = true;
            this.generateExcelSuccess = false;
            // this.getVoucherStat(this.ststBody);
            // this.getList();
            this.clearFilter();
          }
          else {
            this.error_message = vouchers?.message ?? 'Something went wrong!'
            this.generatefailBool = true;
          }
        },
          err => {
            this.error_message = err?.error?.message ?? 'Something went wrong!'
            this.generatefailBool = true;
            console.log(err);
          })
      }
      else if (this.voucherCodeGenerateForm.controls.vgMode.value === 'bulk') {
        //todo
        const payload: VoucherExcelData = {
          RefOrganization_OrganizationId: orgId,
          RefEvent_Code: this.eventCode + "",
          file: this.file,
          bulkGroupName: this.voucherCodeGenerateForm.controls.vGroupName?.value.trim(),
          isNewGroupName: this.isNewGroupName
        };
        this.voucherService.generateAssignedBulkExcel(payload).subscribe(response => {
          if (response?.status === 200) {
            this.excelUploadStatus = { ...response, refEvent_Code: this.eventCode };
            this.generateSuccess = true;
            this.generateExcelSuccess = false;
            // this.getVoucherStat(this.ststBody);
            // this.getList();
            this.clearFilter();
          }
          else {
            this.error_message = response?.message ?? 'Something went wrong!'
            this.generatefailBool = true;
          }
        },
          err => {
            this.error_message = err?.error?.message ?? 'Something went wrong!'
            this.generatefailBool = true;
            console.log(err);
          })
      }
    }
    if (this.voucherCodeGenerateForm.controls.vType.value === 'vunassigned') {
      body = {
        organizationId: orgId,
        voucherCount: this.voucherCodeGenerateForm.get("numberofapplication")?.value,
        eventCode: this.eventCode,
        bulkGroupName: this.voucherCodeGenerateForm.controls.vGroupName?.value.trim(),
        isNewGroupName: this.isNewGroupName
      }
      this.voucherService.GenerateBulkVouchers(body).subscribe(response => {
        if (response?.status === 200) {
          this.generateSuccess = true;
          this.generateExcelSuccess = false;
          // this.getVoucherStat(this.ststBody);//************************* */
          // this.getList();
          this.clearFilter();
        }
        else {
          this.error_message = response?.message ?? 'Something went wrong!'
          this.generatefailBool = true;
        }

      },
        err => {
          this.error_message = err?.error?.message ?? 'Something went wrong!'
          this.generatefailBool = true;
          console.log(err);
        })
    }
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  clearButton() {
    let result = false;
    if (
      // this.voucherSearchFilter.value.organizationname != null ||
      this.voucherCodeGenerateForm.value.numberofapplication != null
    ) {
      result = true;
    }
    else if (this.voucherSearchFilter.value.columnName != null ||
      this.voucherSearchFilter.value.filterTxt != null) {
      result = true;
    }
    return result;
  }

  clearFilter() {
    this.voucherCodeGenerateForm.reset();
    this.voucherSearchFilter.reset();
    this.numberofapplication = '';
    this.voucherCodeGenerateForm.get('organizationname')?.setValue(this.userOrganizationId);
    this.voucherCodeGenerateForm.get('vgMode')?.patchValue('single');
    this.voucherCodeGenerateForm.get('vType')?.patchValue('vassigned');
    this.voucherCodeGenerateForm.controls.vGroup.patchValue('vgroupnew')
    if (this.isUserAgent) {
      this.filter.filter = {
      }
      this.getList();
      this.getVoucherStat({});//**************************** */
    }
    else {
      this.getList();
      this.getVoucherStat(this.ststBody);
      this.voucherGroupNameList();
    }
  }

  getList() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }

  incrDecr(event) {
    let count = this.voucherCodeGenerateForm.get("numberofapplication")?.value;
    if (count === null) {
      if (event == "+") {
        count = 1;
      }
      else return
    } else if (event == "+") {
      count = +count + 1;
    } else if (event == "-" && +count > 1) {
      count = +count - 1;
    }
    this.voucherCodeGenerateForm.controls.numberofapplication.patchValue(count);

  }

  dateFM(date) {
    const formattedInitDate = moment(date + 'Z');
    const finalDate = formattedInitDate.toLocaleString();
    return new DatePipe('en-Us').transform(finalDate, 'dd-MM-yyyy hh:mm:ss a');
  }

  translate(key: string) {
    const translateKey = 'GenerateVoucher';
    return this.translateService.instant(translateKey + '.' + key);
  }
  // downloadFile(){
  //   this.voucherService.DownloadVouchersExcel(this.userOrganizationCode).subscribe(data=>{
  //     const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     let link = document.createElement("a");
  //     if (link.download !== undefined) {
  //       let url = URL.createObjectURL(blob);
  //       link.setAttribute("href", url);
  //       link.setAttribute("download", "Voucher_Codes.xlsx");
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //     }
  //   },err=>{
  //     this.error_message = err?.error?.message ?? 'Something went Wrong!'
  //     this.excelfailBool = true;
  //     console.log(err)
  //   })
  // }

  // /**
  //    * Method is use to download file.
  //    * @param data - Array Buffer data
  //    * @param type - type of the document.
  //    */
  //  downLoadFile(data: any, type: string) {
  //   let blob = new Blob([data], { type: type});
  //   let url = window.URL.createObjectURL(blob);
  //   let pwa = window.open(url);
  //   if (!pwa || pwa.closed || typeof pwa.closed == 'undefined') {
  //       alert( 'Please disable your Pop-up blocker and try again.');
  //   }
  // }
  getVoucherStat(body: any) {
    this.voucherService.VoucherStatistics(body).subscribe(data => {
      this.voucherStats = data.data ?? []
    }, err => {
      console.log(err);
    })
  }

  gotoPage(page: number) {
    const index = page - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  get vsf() {
    return this.voucherSearchFilter.controls;
  }

  filterVoucherList() {
    const columnId = this.vsf.columnName.value;
    const filterTxt = this.vsf.filterTxt.value;
    const selectedFilterItem = this.filterSelectionItems.find(item => item.id === columnId);
    if (selectedFilterItem) {
      const { searchType, value: filterKey } = selectedFilterItem;
      if (searchType === SearchType.Text) {
        const filterValue = filterTxt?.trim();
        this.filter.filter = { [filterKey]: '#' + filterValue + '#' }
      } else if (searchType === SearchType.Select) {
        let filterValue: unknown;
        if (columnId === 3) {
          filterValue = this.organizations.find(item => item.id === filterTxt)?.name;
        } else {
          filterValue = filterTxt;
        }
        this.filter.filter = { [filterKey]: filterValue }
      }
      this.getList();
    }
  }

  selectColumnChange(event: any) {
    this.getVoucherStat({});
    this.vsf.filterTxt.setValue(null);
    this.vsf.filterTxt.markAsUntouched();
  }

  statisticsFetch() {
    if (this.vsf.columnName.value === 3) {
      const body = {
        organizationId: this.vsf.filterTxt.value
      }
      this.getVoucherStat(body);
    }
  }

  openDownloadFileDialog(type: number) {
    this.excelDownloadType = type;
    this.openDownloadDialogBoolean = true;
  }

  unassignedCheck(id: number) {
    // alert("hi")
    this.voucherCodeGenerateForm.controls.emailId.patchValue(null);
    this.voucherCodeGenerateForm.controls.numberofapplication.patchValue(null);
    if (id == 1) {
      this.disableRadio = false;
      this.voucherCodeGenerateForm.get('vgMode')?.patchValue('single');
    }
    else {
      this.disableRadio = true;
      this.voucherCodeGenerateForm.get('vgMode')?.patchValue(null);
    }
    console.log("this.disableRadio> ", this.disableRadio)
  }

  uploadfile(args) {
    console.log("args> ", args.target.files.length)
    this.file = null;

    if (args.target.files && args.target.files.length) {
      this.file = <File>args.target.files[0];
      console.log("this.file.type> ", this.file.type)
      if (
        this.file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        this.file.type === 'application/x-zip-compressed'
      ) {
        this.fileType = null;
      } else {
        this.fileType = this.file.name;
        this.voucherCodeGenerateForm.controls.uploadzipfile.reset();
        this.file = null;
      }
    }
    console.log("args2> ", this.file, this.fileType)
  }

  fileReset() {
    this.voucherCodeGenerateForm.controls.uploadzipfile.reset();
    this.file = null;
  }

  onChangeBulkMode() {
    this.voucherCodeGenerateForm.controls.emailId.patchValue(null);
    this.fileReset()
  }

  closeSuccessModal() {
    const isSuccessModal = this.generateSuccess || this.generateExcelSuccess;
    this.generateSuccess = false;
    this.excelfailBool = false;
    this.generatefailBool = false;
    this.generateExcelSuccess = false;
    this.disableRadio = false;
    this.getList();
    if (isSuccessModal) this.getVoucherStat({});
  }

  resendVoucher(data) {
    const body = {
      email: data.email,
      id: data.id
    }
    this.voucherService.resendVoucher(body).subscribe(
      response => {
        this.resendVoucherNotificationSuccess = true
      },
      error => {
        this.resendVoucherNotificationFailure = true
        this.resendVoucherNotificationErrMsg = error?.error?.message ?? 'Something went wrong!'
      }
    )
  }

  vgroupCheck(id: number) {
    this.isNewGroupName = id === 1 ? true : false;
    this.voucherCodeGenerateForm.controls.vGroupName.patchValue(null);
  }

  selectVoucherGroup(event: any) {
  }

  unassignedDisable() {
    let result = false;
    if (!this.voucherCodeGenerateForm.controls.numberofapplication.value
      || this.voucherCodeGenerateForm.controls.numberofapplication.invalid
      || !this.voucherCodeGenerateForm.controls.vGroupName.value
      || this.voucherCodeGenerateForm.controls.vGroupName.invalid) {
      result = true;
    }
    return result;
  }

  assignedSingleDisable() {
    let result = false;
    if (!this.voucherCodeGenerateForm.controls.emailId.value
      || this.voucherCodeGenerateForm.controls.emailId.invalid
      || !this.voucherCodeGenerateForm.controls.vGroupName.value
      || this.voucherCodeGenerateForm.controls.vGroupName.invalid) {
      result = true;
    }
    return result;
  }

  assignedBulkDisable() {
    let result = false;
    if (!this.file
      || !this.voucherCodeGenerateForm.controls.vGroupName.value
      || this.voucherCodeGenerateForm.controls.vGroupName.invalid) {
      result = true;
    }
    return result;
  }

  onVoucherGroupNameBlur() {
    const control = this.voucherCodeGenerateForm.get('vGroupName');
    const value = control?.value;
    if (value) {
      const body = {
        refOrganization_Id: this.userOrganizationId,
        bulkGroupName: value,
      }
      this.voucherService.validateVoucherGroup(body).subscribe(resp => {
        if (resp?.status === 300) {
          control.setErrors({ notUnique: true });
        }
        else if (resp?.status !== 200) {
          control.setErrors({ beerror: true });
        }
      }, error => {
        if (error?.error?.status === 300) control.setErrors({ notUnique: true });
      })
    }
  }

  voucherGroupNameList() {
    this.voucherService.voucherGroupNameList(this.userOrganizationId, false).subscribe(org => {
      this.voucherGroupList = org.dataList;
    })
  }

  updateEmail(data: any) {
    this.updateEmailData = data.id;
    this.updateEmailBoolean = true;
  }

  closeUpdateEmail(event) {
    this.updateEmailBoolean = false;
    if (event !== false) {
      this.voucherService.updateEmailID(event).subscribe(() => {
        this.updateEmailSuccessBoolean = true;
        this.updateEmailFailedBoolean = false;
      },
        (error: any) => {
          this.updateEmailFailedBoolean = true;
          this.updateEmailSuccessBoolean = false;
          this.updateEmailFailedMessage = error?.error?.message || 'Something went wrong!'
        }
      )
    }
  }

  closeUpdateEmailSuccessFailModal() {
    this.updateEmailSuccessBoolean = false;
    this.updateEmailFailedBoolean = false;
    this.getList();
  }

}
