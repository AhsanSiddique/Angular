import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AccomadationService, IPropertyGuestObject, MetadataService } from '@fan-id/api/server';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';

@Component({
  selector: 'fan-id-accommodation-property-guest-update-details',
  templateUrl: './accommodation-property-guest-update-details.component.html',
  styleUrls: ['./accommodation-property-guest-update-details.component.scss']
})
export class AccommodationPropertyGuestUpdateDetailsComponent implements OnInit {
  @Input() guestData: IPropertyGuestObject | null = null;
  @Output() _close = new EventEmitter();
  EmailRegex= /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;

  updateForm = this.fb.group({
    country: ['', [Validators.required]],
    documentNo: ['', [Validators.required, Validators.maxLength(20)]],
    guestName:['', [Validators.required]],
    emailId:['',[Validators.required]]
  })

  countries$ = this.metadataService.getNationalities({ languageId: 1 });
  documentMask = 'A*';
  nameMaskPattern = { 'S': { pattern: /[-.a-zA-ZÀ-ÿ]/ } };
  updateSuccess = false;
  updateError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private metadataService: MetadataService,
    private accommodationService: AccomadationService,
  ) { }

  ngOnInit() {
    this.setFormData();
  }

  setFormData() {
    if (this.guestData) {
      this.country.setValue(this.guestData.guestNationality_Code);
      this.documentNo.setValue(this.guestData.guestDocumentNumber);
      this.updateForm.patchValue({
        guestName:this.guestData.guestName,
        emailId:this.guestData.guestEmail
      });
    }
  }

  get uf() {
    return this.updateForm.controls;
  }

  get country() {
    return this.uf.country;
  }

  get documentNo() {
    return this.uf.documentNo;
  }

  get guestName() {
    return this.uf.guestName;
  }

  get emailId() {
    return this.uf.emailId;
  }

  get nationalitySearchFn() {
    return nationalitySearchFn;
  }

  submitForm() {
    if (this.updateForm.invalid) {
      return;
    }
    const id = this.guestData?.guestId ?? -1;
    const { country: guestNationality_Code, documentNo: guestDocumentNumber, guestName, emailId: email } = this.updateForm.value;
    const body = { id, guestNationality_Code, guestDocumentNumber, guestName, email};
    this.accommodationService.updateGuestDetails(body)
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
