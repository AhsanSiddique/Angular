import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import {
  ApplicantService,
  BulkRegistrationDraftGetListRequestPagingRequest,
  BulkRegistrationDraftGetListResponse,
  CreateBulkRegistrationDraftInsertRequestList,
} from '@fan-id/api/server';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, delay, first, take, tap } from 'rxjs/operators';
import * as $ from 'jquery';
import { ManualStepOneForm } from '../manual-upload-step1/manual-upload-step1.component';
import { MenuService } from '@fan-id/core';

@Component({
  selector: 'fan-id-manual-upload-step3',
  templateUrl: './manual-upload-step3.component.html',
  styleUrls: ['./manual-upload-step3.component.scss'],
})
export class ManualUploadStep3Component implements OnInit, OnDestroy {
  stepOneFormData: ManualStepOneForm;
  eventname = '';
  organizationname = '';
  bulkgroupname = '';
  numberofapplication = '';
  deliverytype = '';
  servicecentre = '';
  show_cancel_modal = false;
  dtOptions: DataTables.Settings = {};

  @Input() feature? = 'manual-upload'
  @Input() _bulkgroupname?: string;

  dtTrigger: Subject<any> = new Subject<any>();

  @ViewChild(DataTableDirective, { static: false })
  datatableElement: DataTableDirective;

  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

  processing = false;
  uploadbtnvisible = true;
  submittedStatus = false;
  importeddata: BulkRegistrationDraftGetListResponse[] = [];
  processingdata: any;
  events: any;
  organizations: any;
  servicecentres: any;
  importListTemp: any = [];
  importListToSave: any = [];
  subStatus: any;
  togglePanel = false;

  listRequest: BulkRegistrationDraftGetListRequestPagingRequest;
  loading = false;
  submittedError = null;
  failedList = [];

  show_delete_modal = false;
  delete_payload = { id: null, system_RowVersion: null}

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private applicantService: ApplicantService,
    private menuService: MenuService
  ) {
    this.stepOneFormData = this.router.getCurrentNavigation()?.extras?.state?.manualStepOneFormData;
  }

  ngOnInit(): void {
    if( this.feature === 'manual-upload' ) {
      if(!this.stepOneFormData) {
        this.cancel();
        return;
      }

      this.eventname = this.stepOneFormData?.eventname;
      this.organizationname = this.stepOneFormData?.organizationname;
      this.bulkgroupname = this.stepOneFormData?.bulkgroupname;

    } else if( this.feature === 'bulk-group-continue' ) {
      this.eventname = this.menuService.getSelectedEventCode()
      this.bulkgroupname = this._bulkgroupname
      this.organizationname = localStorage.getItem('organizationId')
  }



    this.loading = true;

    this.listRequest = {
      filter: {
        // bulkGroupName: 'draftFifa',
        // refEvent_Code: 'FIFA World Cup 2022',
        // refOrganization_Id: 112,
        bulkGroupName: this.bulkgroupname,
        refEvent_Code: this.eventname,
        refOrganization_Id: +this.organizationname,
      },
      // orderByModel: [{ fieldName: 'System_CreatedOn', sortType: 2 }], // not working, error
      pageIndex: 0,
      pageSize: 0,
      countRequired: true,
    };

    this.dtOptions = {
      // select:'multiple',
      pagingType: 'full_numbers',
      pageLength: 10,
      searching: false,
      processing: true,
      info: false,
      lengthChange: false,
      columnDefs: [
        {
          targets: [0, 1, 5, 7], // column index (start from 0)
          orderable: false, // set orderable false for selected columns
        },
      ],
      initComplete: function (settings, json) {
        $('#importdatatable').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };

    this.getTableData();
  }

  getTableData() {
    this.applicantService
      .getBulkRegistrationDraftList(this.listRequest)
      .pipe(first())
      .subscribe(
        (response) => {
          let dataList = response?.dataList ?? [];
          dataList = this.transformData({
            data: dataList,
            uploadstatus: 'Success',
          });
          this.importeddata = dataList;
          this.loading = false;
          this.dtTrigger.next();
        },
        (error) => {
          this.loading = false;
          console.error(error);
        }
      );
  }

  transformData({
    data,
    uploadstatus,
  }: {
    data: BulkRegistrationDraftGetListResponse[];
    uploadstatus: string;
  }) {
    return data
      .map((item) => {
        const {
          profilePic,
          isBulkRegistrationDraft,
          docImageFront,
          ...rest
        } = item;
        if (isBulkRegistrationDraft) {
          const _profilePic = this.applicantService.composeImageUrl(
            profilePic,
            true,
          );
          const _docImageFront = this.applicantService.composeImageUrl(
            docImageFront,
            true,
          );
          return {
            ...rest,
            profilePic: _profilePic,
            docImageFront: _docImageFront,
            uploadstatus,
          };
        }

        return null;
      })
      .filter(Boolean);
  }

  onSubmit() {
    if (this.importListTemp.length != 0) {
      this.processing = true;

      const totalSubmissions = this.importListTemp.length;
      this.processingdata = { totalCount: totalSubmissions };
      const data = this.importListTemp.map((id) => ({ id, isDraft: true }));
      const body: CreateBulkRegistrationDraftInsertRequestList = {
        data,
        refSystemUser_Id: 3,
        submitReasonType: 1,
        channel: 8,
      };

      this.applicantService
        .submitBulkregistrationDraft(body)
        .pipe(
          first(),
          tap((response) => {
            const { totatlFailed, totatlSuccess, failedList } = response;
            this.subStatus = {
              succesRecords: totatlSuccess,
              failedRecords: totatlFailed,
            };
            this.failedList = failedList;
          }),
          delay(500 * totalSubmissions),
          catchError((err) => throwError(err))
        )
        .subscribe(
          () => {
            this.processing = false;
            this.submittedStatus = true;
          },
          (error) => {
            console.error(error);
            this.processing = false;
            this.submittedError =
              error?.error?.message || 'Something went wrong!';
          }
        );
    } else {
      window.alert('Please select atleast one record for submission');
    }
  }

  closeSubmitError() {
    this.submittedError = null;
  }

  selectMember(importid: string, isChecked) {
    if (isChecked.target.checked) {
      this.importListTemp.push(importid);
    } else {
      const index = this.importListTemp.indexOf(importid);
      this.importListTemp.splice(index, 1);
    }
  }

  checkAll(args) {
    this.checkboxes.forEach((element) => {
      if (args.target.checked) {
        element.nativeElement.checked = true;
        this.importListTemp.push(+element.nativeElement.id);
      } else {
        const index = this.importListTemp.indexOf(element.nativeElement.id);
        element.nativeElement.checked = false;
        this.importListTemp.splice(index, 1);
      }
      this.importListTemp = [...new Set(this.importListTemp)];
    });
  }

  deleteApplicationDraft(id: number, system_RowVersion: string, confirm = true) {
    this.show_delete_modal = confirm;
    if(confirm) {
      this.delete_payload = {id, system_RowVersion};
      return;
    }

    this.applicantService.deleteApplicantFromBulkDraft(this.delete_payload)
      .pipe(take(1))
      .subscribe(response => {
        console.log({ response })
        this.importeddata = this.importeddata.filter(item => item?.id !== id)
      },
      error => {
        console.log('delete applicant error', {error})
      }
      )
  }

  editApplicationDraft(id: number) {
    this.router.navigate(['../edit'], { relativeTo: this.route, queryParams: { id }})
  }

  close(event: string) {
    this.submittedStatus = false;
    this.feature === 'manual-upload' && this.router.navigate(['main', 'dashboard'])
    // if (event === 'step-4') {
    //   this.router.navigate(['../step-4'], {
    //     relativeTo: this.route,
    //     state: {
    //       failedList: this.failedList,
    //       manualStepOneFormData: this.stepOneFormData,
    //     },
    //   });
    // }
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  cancel() {
    if( this.feature === 'manual-upload')
      this.router.navigate(['main/bulk-registration']);
    else if ( this.feature === 'bulk-group-continue')
      this.router.navigate(['main/bulk-groups/step-1'])
  }
}
