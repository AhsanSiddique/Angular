import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApplicantService, EntryPermitHistoryListObject, EntryPermitHistoryRequest } from '@fan-id/api/server';
import { take } from 'rxjs/operators';

const EmailRegex = /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;


@Component({
  selector: 'fan-id-entry-permit-history',
  templateUrl: './entry-permit-history.component.html',
  styleUrls: ['./entry-permit-history.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntryPermitHistoryComponent implements OnInit {
  @Input() _open = false;
  @Input() filter: EntryPermitHistoryRequest;
  @Input() applicant_data: any;
  permitResendForm = this.fb.group({
    permitResendEmail: [null]
  });
  entryPermit_checked = false;
  loading = false;

  permitHistoryList: EntryPermitHistoryListObject[];

  email_success = false;
  email_error: string = null;
  showpdfModal = false;
  documentpdfSrc: string | null = null;
  resendEmailVisible = false;

  constructor(
    private fb: FormBuilder,
    private applicantService: ApplicantService, 
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.resendEmailVisible = this.applicant_data?.border_Entry_Status !== '1';
  }

  open() {
    this._open = true;
    this.getList();
  }

  close() {
    this._open = false;
  }

  getList() {
    this.loading = true;
    this.applicantService.getEntryPermitHistory(this.filter)
    .pipe(take(1))
    .subscribe(
      (res) => {
        const dataList = res?.data ?? [];
        dataList.sort((a, b) => b?.id - a?.id)
        this.permitHistoryList = dataList;
        this.loading = false;
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
        this.permitHistoryList = [];
        this.loading = false;
        this.cd.detectChanges();
      }
    );
  }

  onEntryPermitSendEmailChange(checked: boolean) {
    if(checked) {
      this.permitResendForm.controls.permitResendEmail.setValidators([
        Validators.required,
        Validators.pattern(EmailRegex),
        Validators.maxLength(40),
      ]);
    } else {
      this.permitResendForm.controls.permitResendEmail.clearValidators();
    }

    this.permitResendForm.controls.permitResendEmail.updateValueAndValidity();
    this.cd.detectChanges();
  }

  resendEmail() {
    const { permitResendEmail: email } = this.permitResendForm.value;
    const hasSecondaryEmail = this.entryPermit_checked;
    const body = {
      ...(hasSecondaryEmail ? { email }: {}),
      fanIdNo: this.filter.fanIdNo,
    }

    this.applicantService.sendEntryPermitEmail(body)
    .pipe(take(1))
    .subscribe(
      () => {
        this.close();
        this.email_success = true;
        this.cd.detectChanges();
      },
      (err) => {
        console.log(err);
        this.close();
        this.email_error = err?.error?.message ?? 'Error';
        this.cd.detectChanges();
      }
    );
  }

  async showEntryPermitPreview() {
    const fanIdNo = this.filter.fanIdNo;
    try {
      this.documentpdfSrc = await this.applicantService.getEntryPermitPreviewURL(fanIdNo);
      this.showpdfModal = true;
      this.cd.detectChanges();
    } catch (error) {
      console.log(error);
    }
  }

  closepdfModal(){
    this.showpdfModal = false;
    this.documentpdfSrc = null;
  }

  closeEmailSendSuccess() {
    this.email_success = false;
  }

  closeEmailSendError() {
    this.email_error = null;
  }

}
