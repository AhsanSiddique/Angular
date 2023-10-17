import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActiveConferenceEventListResponse, BulkGroupName, BulkGroupService, ESubmissionType, MetadataService, OrganizationService } from '@fan-id/api/server';
import { DataTableDirective } from 'angular-datatables';
import { BehaviorSubject, of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Environment, FanIDConfig, MenuService } from '@fan-id/core';
import { Router } from '@angular/router';
import { catchError, map, take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'fan-id-bulk-group-step1',
  templateUrl: './bulk-group-step1.component.html',
  styleUrls: ['./bulk-group-step1.component.scss'],
})
export class BulkGroupStep1Component
  implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  dtOptions: DataTables.Settings | undefined;
  dtTrigger: Subject<any> = new Subject<any>();

  organizations = [];
  organizationList = [];
  submissionType = this.metadataService.getSubmissionType()
  bulkgroups = [];
  applicationStats: any;
  filter: any = {};
  bulkgroupdata = [];

  bulkgroupfilter!: FormGroup;
  pageConfig: any = {
    id: 'BulkGroupPager',
    currentPage: 1,
    totalItems: 100,
    itemsPerPage: 10,
  };
  eventName: string;
  userOrganizationId = 0;
  eventCode: string;
  private apiUrl: string;
  bulkGroupName = null;
  isUserAgent: boolean;
  displayEventName;

  filterColumns = [
    {
      name: 'Organization Name',
      dataKey: 'name',
      type: 'text'
    },
    {
      name: 'Organization Group Name',
      dataKey: 'bulkGroupName',
      type: 'text'
    },
    {
      name: 'Organization Category',
      dataKey: 'OrganizationCategoryName',
      type: 'text'
    },
    {
      name: 'Submission Type',
      dataKey: 'submissionType_Name',
      type: 'text'
    },
    {
      name: 'Creation Date',
      dataKey: 'System_CreatedOn',
      type: 'date'
    },
    {
      name: 'Organization Admin Name',
      dataKey: 'contactName',
      type: 'text'
    },
    {
      name: 'Organization Email ID',
      dataKey: 'email',
      type: 'text'
    },
    {
      name: 'Category of Hayya Visit',
      dataKey: 'refCustomerCategory_Code',
      type: 'select',
      itemList: this.getHayyaVisitCategoryList()
    },
    {
      name: 'Conference',
      dataKey: 'refConferenceEvent_Id',
      type: 'select',
      itemList: this.getConferenceList()
    },
    // {
    //   name: 'Applicant Category',
    //   dataKey: 'refRegUserCategory_Code',
    //   type: 'select',
    //   itemList: this.getApplicantCategoryList()
    // }
  ]

  baseFilter: {
    eventCode: string,
    organizationId: number,
  }
  voucherStats: any;
  statusFilterChecker = '';
  dateToday!: NgbDateStruct;
  selected_bulkgroup_data: any;
  show_update_accommodation_modal = false;
  permission:any;
  allPermission:any;
  dtProcessing$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private bulkGroupService: BulkGroupService,
    private http: HttpClient,
    private router: Router,
    private translateService: TranslateService,
    private menuService: MenuService,
    private metadataService: MetadataService,
    private organizationService: OrganizationService,
  ) {
    this.apiUrl = this.config.apiUrl;
    this.isUserAgent = this.menuService.isUserTypeAgent;
    if (this.isUserAgent) {
      this.bulkgroupfilter = new FormGroup({
        columnName: new FormControl(),
        filterTxt: new FormControl(),
      });
    } else {
      this.bulkgroupfilter = new FormGroup({
        organizationname: new FormControl(),
        bulkgroupname: new FormControl(),
      });
    }

    const today = new Date();
    this.dateToday = {
			year: today.getFullYear(),
			month: today.getMonth()+1,
			day: today.getDate(),
		};
  }

  ngOnInit(): void {
    try {
      this.getpermission();
      this.eventName = localStorage.getItem('event');
      this.displayEventName = localStorage.getItem('displayEvent');
      this.eventCode = localStorage.getItem('eventCode');
      this.userOrganizationId = parseInt(localStorage.getItem('organizationId'));
      this.bulkgroupfilter
        .get('organizationname')
        ?.patchValue(this.userOrganizationId);
      // this.cd.detectChanges();

      this.baseFilter = {
        eventCode: this.eventCode,
        organizationId: this.userOrganizationId,
      };
      this.filter.filter = {
        ...this.baseFilter
      };
      this.filter.orderByModel = [
        { fieldName: 'BulkGroup_System_CreatedOn', sortType: 2 },
      ];
      // this.filter.pageIndex = this.pageConfig.currentPage - 1;
      this.filter.pageSize = this.pageConfig.itemsPerPage;
      this.filter.countRequired = true;
      this.dtOptions = {
        paging: false,
        pagingType: 'full_numbers',
        pageLength: 10,
        searching: false,
        ordering: false,
        processing: false,
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
              this.config.apiUrl +
              '/api/BulkRegistrationDraft/Get-List-By-Bulk-Group-Name',
              {
                ...this.filter,
                pageIndex:
                  dataTablesParameters.start / dataTablesParameters.length,
              }
            )
            .pipe(
              // take(1),
              catchError((error) => {
                console.log(error);
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
        },
        columns: [
          {},
          {
            data: 'bulkGroup_System_CreatedOn',
          },
          {
            data: 'bulkGroupName',
          },
          ...(this.isUserAgent
            ? [
              {
                data: 'name',
              },
            ]
            : []),
          {
            data: 'organizationCategory_Translation_Name',
          },
          {
            data: 'submissionType_Name',
          },
          {
            data: 'refSerivceCenter_Code',
          },
          {
            data: 'submittedToLiferayCount',
          },
          {
            data: 'draftCount',
          },
          ...(this.isUserAgent
            ? [
              {
                data: 'email',
              },
            ]
            : []),
          ...(this.isUserAgent
            ? [
              {
                data: 'phoneAreaCode',
              },
            ]
            : []),
          ...(this.isUserAgent
            ? [
              {
                data: 'phoneNumber',
              },
            ]
            : []),
          ...(this.isUserAgent
            ? [
              {
                data: 'contactName',
              },
            ]
            : []),
          {
            data: 'customerCategory_Name',
          },
          {
            data: 'conferenceEvent_Name',
          }
        ],
        //**************** */
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
      if (!this.isUserAgent) {
        this.bulkGroupService
          .getOrganization(this.userOrganizationId)
          .pipe(take(1))
          .subscribe(
            (response) => {
              const { id, name } = response?.data ?? {};
              this.organizations = [
                {
                  id,
                  name,
                },
              ];
            },
            (err) => {
              console.log(err);
            }
          );
      }
      else {
        this.bulkGroupService
          .getOrganizations()
          .subscribe(response => {
            this.organizationList = response?.dataList ?? []
          }, err => {
            console.log(err)
          });
      }

      this.getStatistics();
    } catch (error) {
      console.log({ error });
    }
  }
  getpermission(){
    const permissionList = JSON.parse(localStorage.getItem('PermissionList'));
      this.permission = permissionList?.roles?.find(
        (element) => element?.key === 'Customer Application'
      );
      this.allPermission = permissionList?.fullAccess;

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  getStatistics() {
    const statisticsRequest = {
      eventCode: this.eventCode,
      ...(!this.isUserAgent ? { organizationId: this.userOrganizationId } : null),
      ...(this.bulkGroupName ? { bulkGroupName: this.bulkGroupName } : {}),
    };
    this.bulkGroupService
      .getApplicationStatistics(statisticsRequest)
      .pipe(take(1))
      .subscribe((response) => {
        this.applicationStats = response?.data;
      });
  }

  public filterbulkgroup() {
    console.log(this.bulkgroupfilter.value);
    this.bulkGroupName = this.bulkgroupfilter.value.bulkgroupname?.trim();
    if(this.isUserAgent) {
      const { dataKey, type } = this.bulkgroupfilter.value.columnName ?? {};
      let filterTxt = null
      if(type === 'date') {
        const formattedInitDate = this.bulkgroupfilter.value.filterTxt;
        const dateis = new Date(formattedInitDate.year, formattedInitDate.month-1, formattedInitDate.day);
        filterTxt = new DatePipe('en-Us').transform(dateis, 'dd-MM-yyyy');
      } else {
        filterTxt = this.bulkgroupfilter.value.filterTxt;
        if(typeof filterTxt === 'string') {
          filterTxt = filterTxt.trim();
        }
      }
      if(!dataKey || !filterTxt) return;
      if (type === 'text') {
        filterTxt = '#' + filterTxt + '#';
      }
      this.filter.filter = {
        ...this.baseFilter,
        [dataKey]: filterTxt
      }
      if(this.bulkgroupfilter.value.columnName.dataKey ==='name'){
        this.statisticsFetch();
      }
    } else {
      this.filter.filter = {
        ...this.baseFilter,
        ...(this.bulkGroupName
          ? { bulkGroupName: '#' + this.bulkGroupName + '#' }
          : {}),
      };
    }
    this.setPaging(true);
    this.getList();
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  clearButton() {
    let result = false;
    if (
      // this.bulkgroupfilter.value.organizationname != null ||
      this.bulkgroupfilter.value.bulkgroupname != null
    ) {
      result = true;
    }
    return result;
  }

  clearFilter() {
    this.bulkgroupfilter.reset();
    this.bulkGroupName = null;
    this.bulkgroupfilter
      .get('organizationname')
      ?.setValue(this.userOrganizationId);
    this.filter.filter = {
      ...this.baseFilter
    }
    if (this.isUserAgent) { this.statisticsFetch(); }
    this.setPaging(false);
    this.getList();
  }

  getBulkGroups() {
    this.bulkgroups = [];
    this.bulkGroupService
      .getBulkGroups(this.eventCode)
      .pipe(take(1))
      .subscribe((response) => {
        for (const bg of response.dataList) {
          const bgObj: BulkGroupName = new BulkGroupName();
          bgObj.id = bg.bulkGroupName;
          bgObj.name = bg.bulkGroupName;
          this.bulkgroups.push(bgObj);
        }
      });
  }

  getList() {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    }).catch((error) => {
      console.log(error);
    })
  }

  redirectForAddApplication(data: any) {
    const submissionType = data?.submissionType;
    switch (submissionType) {
      case ESubmissionType.PACKAGE:
        this.redirectToPackageStep1(data);
        break;
      case ESubmissionType.EXCEL:
        this.redirectToPackageStep1(data);
        break;
      case ESubmissionType.PACKAGE_EXCEL:
        this.redirectToPackageStep1(data);
        break;
      default:
        this.redirectToManualStep2(data, false);
        break;
    }
  }

  redirectToPackageStep1(data: any) {
    this.router.navigate(['/main/bulk-registration/package-upload/step-1'], {
      queryParams: { type: 'add' },
      state: { data },
    });
  }

  redirectToManualStep2(data: any, _continue = true) {
    const {
      id: organizationname,
      bulkGroupName: bulkgroupname,
      name,
      phoneAreaCode,
      phoneNumber,
      refSerivceCenter_Code: servicecentre,
      maxNumberApplication,
      submittedToLiferayCount,
      orgGroupAccommodationAddress: OrgGroupAccommodationAddress,
      refCustomerCategory_Code: hayyaVisitCategory,
      refRegUserCategory_Code: user_category,
      refConferenceEvent_Id: conferenceId
    } = data;
    const organization = {
      name,
      phoneAreaCode,
      phoneNumber,
    };

    const manualStepOneFormData = {
      organizationname,
      bulkgroupname,
      organization,
      servicecentre,
      continue: _continue,
      numberofapplication: maxNumberApplication - submittedToLiferayCount,
      eventname: this.eventCode,
      deliverytype: 'DHC',
      OrgGroupAccommodationAddress,
      hayyaVisitCategory,
      user_category,
      conferenceId
    };
    this.router.navigate(
      ['/main/bulk-registration/manual-registration/step-2'],
      {
        state: {
          manualStepOneFormData: {
            ...manualStepOneFormData,
          },
        },
      }
    );
  }

  redirectToExcel(data:any) {
    console.log(data)
    const listRequest = {
      filter: {
        bulkGroupName: data.bulkGroupName,
        refEvent_Code: this.eventCode,
        refOrganization_Id: this.userOrganizationId,
      },
      // orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }], // not working, error
      pageIndex: 0,
      pageSize: 0,
      countRequired: true,
    };
    this.bulkGroupService.GetBulkGroupList(listRequest).subscribe(response => {
      const bulkItem={
        dataList:[],
        formData:{
          BulkGroupName: data.bulkGroupName,
          Channel: 8,
          DeliveryAddress: "",
          DocSubType: "",
          RefCardDeliveryType_Code: "data.refSerivceCenter_Code",
          RefEvent_Code: this.eventCode,
          RefOrganization_Id:  this.userOrganizationId,
          RefSerivceCenter_Code: "data.serviceCenter_Name",
          RefSystemUser_Id: ""
        },
        selectedPayload: {
          fileName: "",
          organizationId: {
            name : data.name
          },
          selectedDeliveryType:{
            name : data.serviceCenter_Name
          },
          selectedServiceCentere: {
            name:data.serviceCenter_Name
          }
        }

      }
      response.dataList.forEach(element => {
        if(element.isBulkRegistrationDraft ===true)
        {
        bulkItem.dataList.push({
          customerCardApplication:element,
               importStatus:true,
               responses:[]
        })
      }
      });
      localStorage.setItem("bulkItem",JSON.stringify(bulkItem));
      const state={
        previousPage : 'bulk-upload'
      }
      this.router.navigate(['/main/bulk-registration/upload/step-2'], {
        state});
        // const bulkItem={
        //   dataList:{
        //
        //   }
        // }

        // localStorage.getItem("bulkItem")
      })
  }

  redirectToPackage(data:any) {
    console.log(data);
    const listRequest = {
      filter: {
        bulkGroupName: data?.bulkGroupName,
        refEvent_Code: this.eventCode,
        refOrganization_Id: data?.id,
      },
      pageIndex: 0,
      pageSize: 1,
      countRequired: true,
    };

    this.bulkGroupService.getPackageUploadList(listRequest).subscribe(
      {
        next: (response) => {
          const dataList = response?.dataList ?? []
          const RefRegUserCategory_Code = dataList[0]?.customerCardApplication?.userCategoryCode;
          const RefApplicationType_Code = dataList[0]?.customerCardApplication?.applicationTypeCode;
          const bulkPackageData = {
            BulkGroupName: data?.bulkGroupName,
            RefEvent_Code: this.eventCode,
            RefOrganization_Id: data?.id,
            RefRegUserCategory_Code,
            RefApplicationType_Code
          }
          localStorage.setItem("bulkPackageData", JSON.stringify(bulkPackageData));
          this.router.navigate(['/main/bulk-registration/package-upload/step-2']);
        },
        error: (error) => {
          console.log(error);
        }
      }
    )
  }

  redirectToPackageExcel(data:any) {
    // console.log(data)
    const listRequest = {
      filter: {
        bulkGroupName: data?.bulkGroupName,
        refEvent_Code: this.eventCode,
        refOrganization_Id: data?.id,
      },
      pageIndex: 0,
      pageSize: 1,
      countRequired: true,
    };

    this.bulkGroupService.getPackageUploadList(listRequest).subscribe(
      {
        next: (response) => {
          const dataList = response?.dataList ?? []
          const RefRegUserCategory_Code = dataList[0]?.customerCardApplication?.userCategoryCode;
          const RefApplicationType_Code = dataList[0]?.customerCardApplication?.applicationTypeCode;
          const bulkPackageExcelData = {
            BulkGroupName: data?.bulkGroupName,
            RefEvent_Code: this.eventCode,
            RefOrganization_Id: data?.id,
            RefRegUserCategory_Code,
            RefApplicationType_Code
          }
          localStorage.setItem("bulkPackageExcelData", JSON.stringify(bulkPackageExcelData));
          this.router.navigate(['/main/bulk-registration/package-upload/excel-step-2']);
        },
        error: (error) => {
          console.log(error);
        }
      }
    )
  }

  gotoPage(pagenumber: number) {
    const index = pagenumber - 1;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.page(index).draw(false);
    });
  }

  translate(key: string) {
    const translateKey = 'BulkGroup';
    return this.translateService.instant(translateKey + '.' + key);
  }

  columnChange(event){
    this.bulkgroupfilter.controls.filterTxt.setValue(null);
    if((this.statusFilterChecker ==='name' && event.dataKey !=='name')
    ||(this.statusFilterChecker !=='name' && event.dataKey ==='name')){
          this.statisticsFetch();
    }
  }

  searchdisable(){
    let result = true;
    if (
      this.bulkgroupfilter.value.columnName != null &&
      this.bulkgroupfilter.value.filterTxt != null
    ) {
      result = false;
    }
    return result;
  }

  statisticsFetch(){
    let orgId:number;
    this.organizationList.forEach(item=>{
      if(item.name === this.bulkgroupfilter.value.filterTxt){
        orgId = item.id
      }
    })
    const statisticsRequest = {
      eventCode: this.eventCode,
     ...(this.bulkgroupfilter.value.columnName?.dataKey==='name'? {organizationId:orgId} : null)
    };
      this.bulkGroupService
        .getApplicationStatistics(statisticsRequest)
        .pipe(take(1))
        .subscribe((response) => {
          this.statusFilterChecker = this.bulkgroupfilter.value.columnName?.dataKey ?? ''
          this.applicationStats = response?.data;
        });
  }

  showUpdateAccommodationModal(data: any) {
    this.selected_bulkgroup_data = {...data, eventCode: this.eventCode};
    this.show_update_accommodation_modal = true;
  }

  closeUpdateAccommodationModal(update_success: boolean) {
    this.selected_bulkgroup_data = null;
    this.show_update_accommodation_modal = false;
    if (update_success) {
      this.getList();
    }
  }

  setPaging(state: boolean) {
    this.dtOptions && (this.dtOptions.paging = state);
  }

  getHayyaVisitCategoryList() {
    return this.metadataService.getMetaDataCustomerCategory({}).pipe(
      map((response) => {
        return response?.map((item) => {
          return {
            value: item?.code,
            name: item?.name,
          };
        });
      })
    )
  }

  getConferenceList() {
    return this.organizationService.getActiveConferenceEventList().pipe(
      catchError((error) => { return of({} as ActiveConferenceEventListResponse) }),
      map((response) => {
        const list = response?.data?.conferenceEventLists ?? [];
        return list.map((item) => {
          return {
            value: item?.confrenceId,
            name: item?.name_EN,
          };
        });
      })
    )
  }

  getApplicantCategoryList() {
    return this.metadataService.getRegUserCategories({}).pipe(
      map((response) => {
        return response?.map((item) => {
          return {
            value: item?.code,
            name: item?.name,
          };
        });
      })
    )
  }
}
