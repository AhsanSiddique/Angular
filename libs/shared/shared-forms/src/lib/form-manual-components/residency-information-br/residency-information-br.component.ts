import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicantService, MetadataResolve, NationalityLookup } from '@fan-id/api/server';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';
import { JobTitle, isCountryGCC } from '@fan-id/shared/utils/form';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-residency-information-br-form',
  templateUrl: './residency-information-br.component.html',
  styleUrls: ['./residency-information-br.component.scss']
})
export class ResidencyInformationBrComponent extends FormGroupInput implements OnInit, OnDestroy {
  @Input() metadata$: Observable<MetadataResolve>;
  // @Input() applicantData: CustomerCardApplicationGetListResponse;
  private readonly unsubscribe$ = new Subject<void>();
  nationalitySearchFn = nationalitySearchFn;
  residencyFields = [
    {
      controlName: 'country_birth',
      label: 'Country of Birth',
      placeholder: 'Select Country of Birth',
      type: 'select',
      subType: 'country',
      required: true
    },
    {
      controlName: 'country_residence',
      label: 'Country of Residence',
      placeholder: 'Select Country of Residence',
      type: 'select',
      subType: 'country',
      required: true
    },
    {
      controlName: 'has_previous_nationality',
      label: 'Do you have Other/Previous Nationality?',
      placeholder: 'Select Yes/No',
      type: 'radio',
      options: [{value: 'YES', label: 'Yes'}, {value: 'NO', label: 'No'}],
      required: true
    },
    {
      controlName: 'previous_nationality',
      label: 'Previous Nationality',
      placeholder: 'Select Previous Nationality',
      type: 'previous_nationality'
    }
  ];
  jobTitles$ = new BehaviorSubject<JobTitle[]>([]);
  jobTitlesFull: JobTitle[] = [];
  countryListFull: NationalityLookup[] = [];
  residenceCountryList$ = new BehaviorSubject<NationalityLookup[]>([]);
  isCountryResidenceGCC$: Observable<boolean>;

  constructor(
    private applicantService: ApplicantService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit() {
    this.setResidencyValidators(false);
    this.setJobTitleValidators(false);
    this.metadata$.pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.jobTitlesFull = data.profession as JobTitle[];
            this.jobTitles$.next(this.jobTitlesFull);
            this.countryListFull = data.countries;
            this.residenceCountryList$.next(this.countryListFull);
          }
        }
      });

    this.isCountryResidenceGCC$ = this.f.country_residence.valueChanges.pipe(
      startWith(this.f.country_residence.value),
      map((countryCode) => isCountryGCC(countryCode)),
    );

    this.f.has_previous_nationality.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (hasPreviousNationality) => {
          if (hasPreviousNationality === 'NO') {
            this.f.previous_nationality.setValue(null);
          }
          this.setPreviousNationalityValidators(hasPreviousNationality === 'YES');
        }
      });

    this.f.job_title.valueChanges.pipe(startWith(this.f.job_title.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (job_title: string) => {
          this.setJobTitleOtherValidators(job_title === 'OTHR');
        }
      });
  }

  setResidencyValidators(required: boolean) {
    if (required) {
      this.residencyFields.filter(f => f.required).forEach(({ controlName }) => {
        this.f[controlName].setValidators([Validators.required]);
        this.f[controlName].updateValueAndValidity({ emitEvent: false });
      })
    } else {
      this.residencyFields.filter(f => f.required).forEach(({ controlName }) => {
        this.f[controlName].clearValidators();
        this.f[controlName].updateValueAndValidity({ emitEvent: false });
      })
    }
  }

  setPreviousNationalityValidators(isRequired = false) {
    if (isRequired) {
      this.f.previous_nationality.setValidators([Validators.required]);
    } else {
      this.f.previous_nationality.clearValidators();
    }
    this.f.previous_nationality.updateValueAndValidity();
  }

  setJobTitleValidators(jobTitleRequired = false) {
    if (jobTitleRequired) {
      this.f.job_title.setValidators([Validators.required]);
    } else {
      this.f.job_title.clearValidators();
    }
    this.f.job_title.updateValueAndValidity();
  }

  setJobTitleOtherValidators(isOther = false) {
    if (isOther) {
      this.f.job_title_other.setValidators([Validators.required]);
    } else {
      this.f.job_title_other.clearValidators();
    }
    this.f.job_title_other.updateValueAndValidity();
  }

  setResidenceCountryList(isGCC = false) {
    if (isGCC) {
      this.residenceCountryList$.next(this.countryListFull.filter(({ code }) => isCountryGCC(code)));
    } else {
      this.residenceCountryList$.next(this.countryListFull);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get f() {
    return this.formGroup.controls;
  }

  get af() {
    return (this.parentForm.controls.applicationForm as FormGroup).controls;
  }
}
