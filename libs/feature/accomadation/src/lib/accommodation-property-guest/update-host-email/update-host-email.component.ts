import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { IPropertyGuestObject, AccomadationService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-update-host-email',
  templateUrl: './update-host-email.component.html',
  styleUrls: ['./update-host-email.component.scss']
})
export class UpdateHostEmailComponent implements OnInit {
  @Input() guestData: IPropertyGuestObject | null = null;
  @Output() _close = new EventEmitter();
  EmailRegex = /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;

  updateForm = this.fb.group({
    emailId: ['', [Validators.required]],
    hostName: ['', [Validators.required]],
  })

  updateSuccess = false;
  updateError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private accommodationService: AccomadationService,
  ) { }

  ngOnInit() {
    this.setFormData();
  }

  setFormData() {
    if (this.guestData) {
      this.updateForm.patchValue({
        emailId: this.guestData.hostEmail,
        hostName: this.guestData.hostFullName
      });
    }
  }

  get uf() {
    return this.updateForm.controls;
  }

  get emailId() {
    return this.uf.emailId;
  }

  get hostName() {
    return this.uf.hostName;
  }

  submitForm() {
    if (this.updateForm.invalid) {
      return;
    }
    const hostId = this.guestData?.hostId ?? -1;
    const { emailId: applicationEmail, hostName: HostName } = this.updateForm.value;
    const body = { hostId, applicationEmail, HostName };
    this.accommodationService.updateHostEmail(body)
      .subscribe({
        next: () => {
          this.updateSuccess = true;
        },
        error: (error) => {
          this.updateError = true;
          this.errorMessage = error?.error?.message ?? 'Something went wrong';
        }
      })
  }

}
