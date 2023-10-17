import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CustomerCardApplicationGetListResponse, EAccommodationStatus, VerifyAccommodationService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-verify-accommodation-update-status',
  templateUrl: './verify-accommodation-update-status.component.html',
  styleUrls: ['./verify-accommodation-update-status.component.scss']
})
export class VerifyAccommodationUpdateStatusComponent {
  @Input() applicantData: CustomerCardApplicationGetListResponse | null = null;
  @Input() accommodationStatusToUpdate: EAccommodationStatus = EAccommodationStatus.Approved;
  @Output() _close = new EventEmitter();
  EAccommodationStatus = EAccommodationStatus;
  updateConfirm = true;
  updateSuccess = false;
  updateError = false;
  errorMessage: string | null = null;
  updateForm = this.fb.group({
    reason: ['', [Validators.required, Validators.maxLength(500)]],
  })
  successMessage: Partial<Record<EAccommodationStatus, { title: string, message: string }>> = {
    [EAccommodationStatus.Approved]: {
      title: 'Accommodation Verification Completed',
      message: 'Accommodation details are successfully verified. The application shall be approved shortly.'
    },
    [EAccommodationStatus.Rejected]: {
      title: 'Application Returned',
      message: 'The Proof of Accommodation Verification request has been returned to the Applicant for correction'
    }
  }

  constructor(
    private verifyAccommodationService: VerifyAccommodationService,
    private fb: FormBuilder
  ) {}

  get uf() {
    return this.updateForm.controls;
  }

  closeAccommodationStatusConfirm(event: 'yes' | 'no') {
    this.updateConfirm = false;
    if (event === 'yes') {
      this.updateAccommodationStatus();
    } else {
      this._close.emit();
    }
  }

  updateAccommodationStatus() {
    this.verifyAccommodationService.updateAccommodationStatus({
      fanIdNo: this.applicantData?.fanIdNo ?? '',
      OtherAccommodationStatus: this.accommodationStatusToUpdate,
    }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.updateSuccess = true;
        } else {
          this.updateError = true;
          this.errorMessage = response?.message ?? 'Something went wrong';
        }
      },
      error: (error) => {
        console.log(error);
        this.updateError = true;
        this.errorMessage = error?.error?.message ?? 'Something went wrong';
      }
    })
  }

  submitForm() {
    if (this.updateForm.invalid) {
      return;
    }
    this.updateConfirm = false;
    this.verifyAccommodationService.updateAccommodationStatus({
      fanIdNo: this.applicantData?.fanIdNo ?? '',
      OtherAccommodationStatus: this.accommodationStatusToUpdate,
      rejectReason: this.uf.reason.value
    }).subscribe({
      next: (response) => {
        if (response.status === 200) {
          this.updateSuccess = true;
        } else {
          this.updateError = true;
          this.errorMessage = response?.message ?? 'Something went wrong';
        }
      },
      error: (error) => {
        console.log(error);
        this.updateError = true;
        this.errorMessage = error?.error?.message ?? 'Something went wrong';
      }
    })
  }
}
