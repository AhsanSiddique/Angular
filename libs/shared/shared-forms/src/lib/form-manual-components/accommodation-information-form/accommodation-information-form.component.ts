import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AccomadationService, MetadataResolve } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-accommodation-information-form',
  templateUrl: './accommodation-information-form.component.html',
  styleUrls: ['./accommodation-information-form.component.scss']
})
export class AccommodationInformationFormComponent extends FormGroupInput implements OnInit {
  @Input() metadata$:Observable<MetadataResolve>;
  private readonly unsubscribe$ = new Subject<void>();
  isServiceCentre: boolean;
  accommodationTypes = [
    { code: 1, name: 'Family and Friends' },
    { code: 2, name: 'Other Accommodation' },
  ]
  verifyGuestError$ = new BehaviorSubject<string>('');

  constructor(
    @Inject(FanIDConfig) private appconfig: Environment,
    private accommodationService: AccomadationService,
  ) {
    super();
    this.isServiceCentre = appconfig.application === 'ServiceCenter';
  }

  ngOnInit(): void {
    this.formGroup.addControl('accommodation_verify', new FormControl(false));
    this.f.accommodation_type.setValidators([Validators.required]);
    this.f.accommodation_type.valueChanges.pipe(
      startWith(this.f.accommodation_type.value), takeUntil(this.unsubscribe$)).subscribe({
        next: (accommodation_type: number) => {
          this.setAccommodationNameValidators(accommodation_type);
          this.f.accommodation_verify.setValidators(accommodation_type === 1 ? [Validators.requiredTrue] : []);
          this.f.accommodation_verify.updateValueAndValidity();
          this.verifyGuest(accommodation_type);
        }
      });
  }

  get f() {
    return this.formGroup.controls;
  }

  setAccommodationNameValidators(accommodation_type: number) {
    if (accommodation_type === 2) {
      this.f.accommodation_name.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9-/.#,+'()*_: ]*$/),
        Validators.maxLength(80),
      ]);
    } else {
      this.f.accommodation_name.clearValidators();
    }
    this.f.accommodation_name.updateValueAndValidity();
  }

  verifyGuest(accommodation_type: number) {
    if (accommodation_type === 1) {
      const { document_number: guestDocumentNumber, nationality: guestNationality_Code } =
        (this.parentForm.controls.uploadDocumentForm as FormGroup).getRawValue();
      const body = {guestDocumentNumber, guestNationality_Code}
      this.accommodationService.verifyGuest(body).subscribe({
        next: (res) => {
          if (res) {
            this.f.accommodation_verify.setValue(true);
          }
        },
        error: (err) => {
          console.log(err);
          this.f.accommodation_verify.setValue(false);
          this.verifyGuestError$.next(err?.error?.message || 'Something went wrong');
        }
      });
    }
  }
}
