import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomerCardApplicationGetListResponse, IPendingApplicationVerificationStatusRequest, VerifyApplicationService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-verify-application-return-correction',
  templateUrl: './verify-application-return-correction.component.html',
  styleUrls: ['./verify-application-return-correction.component.scss']
})
export class VerifyApplicationReturnCorrectionComponent  {

  @Input() applicant_data: CustomerCardApplicationGetListResponse | null = null;
  @Output() _close = new EventEmitter();

  updateForm = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  })

  update_success = false;
  update_error = false;
  error_message: string | null = null;

  constructor(private fb: FormBuilder, private verifyService: VerifyApplicationService) { }

  get uf() {
    return this.updateForm.controls;
  }

  submitForm() {
    if (this.updateForm.invalid) {
      return;
    }
    const body: IPendingApplicationVerificationStatusRequest = {
      FANID: this.applicant_data?.fanIdNo ?? "",
      DocumentIdNo: this.applicant_data?.documentIdNo ?? "",
      applicationStatus: 'REJ',
      force: false,
      error: [
        {
          errorCode: 'SC500',
          errorMessage: this.uf.reason.value,
          reasonText: "",
          rejectedReasonType: 1,
        }
      ]
    }
    this.verifyService.verifyApplication_UpdateStatus(body)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.update_success = true;
        },
        error: (error) => {
          console.log(error);
          this.update_error = true;
          this.error_message = error?.error?.message ?? 'Something went wrong';
        }
      })
  }

}
