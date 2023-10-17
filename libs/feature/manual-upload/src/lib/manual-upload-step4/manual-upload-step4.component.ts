import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  ApplicantService,
  BulkRegistrationService,
  CreateBulkRegistrationDraftInsertRequestList,
  ManualService,
  SubmissionStatus,
} from '@fan-id/api/server';
import { of, Subject, throwError } from 'rxjs';
import { catchError, delay, first, tap } from 'rxjs/operators';
import { ManualStepOneForm } from '../manual-upload-step1/manual-upload-step1.component';
import * as $ from 'jquery';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'fan-id-manual-upload-step4',
  templateUrl: './manual-upload-step4.component.html',
  styleUrls: ['./manual-upload-step4.component.scss'],
})
export class ManualUploadStep4Component implements OnInit {
  load: boolean = false;
  processing: boolean = false;
  subStatus: any;
  show_cancel_modal = false;
  uploadbtnvisible: boolean = true;
  submittedStatus: boolean = false;
  showDatatable: boolean = false;
  importeddata: any = null;
  failedList = []
  processingdata: any;
  // message:any;
  importListTemp: any = [];
  importidListToSave: any = [];
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  dtOptions: any = {};

  dtTrigger: Subject<any> = new Subject<any>();

  stepOneFormData: ManualStepOneForm;
  submittedError = null;

  constructor(
    public bulkuploadService: BulkRegistrationService,
    private router: Router,
    private manualUploadService: ManualService,
    private applicantService: ApplicantService
  ) {
    this.stepOneFormData = this.router.getCurrentNavigation()?.extras?.state?.manualStepOneFormData;
    this.failedList = this.router.getCurrentNavigation()?.extras?.state?.failedList;
  }

  ngOnInit(): void {
    this.load = false;

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
        $('#failedrecords').wrap("<div class='fan-id-tablewrap'></div>");
      },
    };

    this.importeddata = this.transformData({
      data: this.failedList,
      uploadstatus: 'Success',
    });

    of(1).pipe(first(),delay(10)).subscribe(() => {
      this.dtTrigger.next();
    })
  }

  transformData({ data, uploadstatus }: { data: any[]; uploadstatus: string }) {
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
        this.importListTemp.push(element.nativeElement.id);
      } else {
        const index = this.importListTemp.indexOf(element.nativeElement.id);
        element.nativeElement.checked = false;
        this.importListTemp.splice(index, 1);
      }
      this.importListTemp = [...new Set(this.importListTemp)];
    });
  }

  submitSelected() {
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
            this.importeddata = this.transformData({data: this.failedList, uploadstatus: 'Success'});
            this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
              // Destroy the table first
              dtInstance.destroy();
              this.dtTrigger.next();
            });
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

  close() {
    this.submittedStatus = false;
  }

  closeSubmitError() {
    this.submittedError = null;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  cancel() {
    this.router.navigate(['main/bulk-registration']);
  }
}
