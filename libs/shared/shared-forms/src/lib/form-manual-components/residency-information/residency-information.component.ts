import { Component, ElementRef, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ApplicantService, CustomerCardApplicationGetListResponse, MetadataResolve, NationalityLookup } from '@fan-id/api/server';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';
import { CATEGORIES_WITH_GCC_PERMIT_SC, fileNamePatternValidator, fileSizeValidator, fileTypeValidator, isCountryGCC, ITicketType, JobTitle, TicketTypes } from '@fan-id/shared/utils/form';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';
import { FanIDConfig, Environment } from '@fan-id/core';

const DOCUMENT_VALIDATORS = [
  Validators.required,
  fileTypeValidator(['image/jpeg'], 'Only JPEG files are allowed'),
  fileNamePatternValidator(/^[a-zA-Z0-9-_. ]+$/, 'Invalid file name'),
  fileSizeValidator(1 * 1024 * 1024, 'File size should be less than 1 MB')
];

interface IViewDocument {
  hasDocument: boolean;
  documentSrc: string;
}

@Component({
  selector: 'fan-id-residency-information-form',
  templateUrl: './residency-information.component.html',
  styleUrls: ['./residency-information.component.scss']
})
export class ResidencyInformationComponent extends FormGroupInput implements OnInit, OnDestroy {
  @Input() metadata$: Observable<MetadataResolve>;
  @Input() applicantData: CustomerCardApplicationGetListResponse;
  private readonly unsubscribe$ = new Subject<void>();
  nationalitySearchFn = nationalitySearchFn;
  visaTypeFields = [
    {
      controlName: 'country_birth',
      label: 'Country of Birth',
      placeholder: 'Select Country of Birth',
      type: 'select',
      subType: 'country',
      requiredForVisaType: true
    },
    {
      controlName: 'country_residence',
      label: 'Country of Residence',
      placeholder: 'Select Country of Residence',
      type: 'select',
      subType: 'country',
      requiredForVisaType: true
    },
    {
      controlName: 'has_previous_nationality',
      label: 'Do you have Other/Previous Nationality?',
      placeholder: 'Select Yes/No',
      type: 'radio',
      options: [{value: 'YES', label: 'Yes'}, {value: 'NO', label: 'No'}]
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
  isPermitDocumentRequired$: Observable<boolean>;
  viewDocument$ = new BehaviorSubject<IViewDocument>({ hasDocument: false, documentSrc: '' });
  permitDocumentFileName$ = new BehaviorSubject<string>('');
  visaCopyFileName$ = new BehaviorSubject<string>('');
  isServiceCentre: boolean;
  selectedFanCategory = new BehaviorSubject<ITicketType>(null);
  selectedFanCategory$ = this.selectedFanCategory.asObservable();
  @ViewChild('permitDocumentFileInput') private permitDocumentFileInput: ElementRef;
  @ViewChild('visaCopyFileInput') private visaCopyFileInput: ElementRef;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private applicantService: ApplicantService,
    private sanitizer: DomSanitizer
  ) {
    super();
    this.isServiceCentre = this.config.application === 'ServiceCenter';
  }

  ngOnInit() {
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

    this.selectedFanCategory$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (category) => {
        try {
          console.log({ category });
          this.setVisaTypeValidators(category?.isVisaType);
          this.setJobTitleValidators(category?.jobTitleRequired);
          this.setVisaCopyValidators(category?.visaCopyRequired);
          this.setResidenceCountryList({ isGCC: category?.isGCC, removeGCC: category?.removeGCC });
        } catch (error) {
          console.log(error);
        }
      }
    })

    if (this.isServiceCentre) {
      this.tf.ticket_type.valueChanges.pipe(startWith(this.tf.ticket_type.value), takeUntil(this.unsubscribe$))
        .subscribe({
          next: (t: ITicketType) => {
            this.selectedFanCategory.next(t);
          }
        })
    } else {
      this.af.fan_category.valueChanges.pipe(startWith(this.af.fan_category.value), takeUntil(this.unsubscribe$))
        .subscribe({
          next: (category: ITicketType['code']) => {
            const t: ITicketType = TicketTypes.find(({ code }) => code === category);
            console.log({ fanCategory: category, t });
            this.selectedFanCategory.next(t);
          }
        })
    }

    this.f.country_residence.valueChanges.pipe(startWith(this.f.country_residence.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (countryCode) => {
          this.setPermitValidators(this.getPermitValidatorsRequired(countryCode));
        }
      });

    this.isPermitDocumentRequired$ = this.f.country_residence.valueChanges.pipe(
      startWith(this.f.country_residence.value),
      map((countryCode) => this.getPermitValidatorsRequired(countryCode)),
    );

    this.f.previous_nationality.valueChanges.pipe(startWith(this.f.previous_nationality.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (nationality) => {
          const jobTitlesOfNationality = this.jobTitlesFull.filter(({ nationalities }) => {
            if (!nationalities || nationalities === 'ALL') return true;
            return nationalities.split(',').includes(nationality)
          });
          this.jobTitles$.next(jobTitlesOfNationality);
        }
      });

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

    this.f.permit_document.valueChanges.pipe(startWith(this.f.permit_document.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (file: File | undefined) => {
          this.permitDocumentFileName$.next(file?.name || 'permit_document.jpg');
        }
      })
    this.f.visa_copy_document.valueChanges.pipe(startWith(this.f.visa_copy_document.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (file: File | undefined) => {
          this.visaCopyFileName$.next(file?.name || 'visa_copy_document.jpg');
        }
      })
  }

  setVisaTypeValidators(isVisaType: boolean) {
    if (isVisaType) {
      this.visaTypeFields.filter(f => f.requiredForVisaType).forEach(({ controlName }) => {
        this.f[controlName].setValidators([Validators.required]);
        this.f[controlName].updateValueAndValidity({ emitEvent: false });
      })
    } else {
      this.visaTypeFields.filter(f => f.requiredForVisaType).forEach(({ controlName }) => {
        this.f[controlName].clearValidators();
        this.f[controlName].updateValueAndValidity({ emitEvent: false });
      })
    }
  }

  setPermitValidators(required = false) {
    if (required) {
      this.f.permit_document.setValidators(DOCUMENT_VALIDATORS);
    } else {
      this.f.permit_document.clearValidators();
    }
    this.f.permit_document.updateValueAndValidity();
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

  setVisaCopyValidators(visaCopyRequired = false) {
    if (visaCopyRequired) {
      this.f.visa_copy_document.setValidators(DOCUMENT_VALIDATORS);
    } else {
      this.f.visa_copy_document.clearValidators();
    }
    this.f.visa_copy_document.updateValueAndValidity();
  }

  setPreviousNationalityValidators(isRequired = false) {
    if (isRequired) {
      this.f.previous_nationality.setValidators([Validators.required]);
    } else {
      this.f.previous_nationality.clearValidators();
    }
    this.f.previous_nationality.updateValueAndValidity();
  }

  setResidenceCountryList({isGCC = false, removeGCC = false}) {
    let countryList = this.countryListFull;
    if (isGCC) {
      countryList = countryList.filter(({ code }) => isCountryGCC(code));
      this.residenceCountryList$.next(countryList);
      return;
    }

    if (removeGCC && !this.isServiceCentre) {
      countryList = countryList.filter(({ code }) => !isCountryGCC(code) && code !== 'QA');
      this.residenceCountryList$.next(countryList);
      return;
    }

    this.residenceCountryList$.next(countryList);
  }

  getPermitValidatorsRequired(countryCode: string) {
    return isCountryGCC(countryCode) &&
      CATEGORIES_WITH_GCC_PERMIT_SC.includes(this.selectedFanCategory.value?.code as any)
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get f() {
    return this.formGroup.controls;
  }

  get tf() {
    return (this.parentForm.controls.ticketForm as FormGroup)?.controls;
  }

  get af() {
    return (this.parentForm.controls.applicationForm as FormGroup)?.controls;
  }

  onPermitDocumentSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.f.permit_document.setValue(file);
    this.f.permit_document.markAsTouched();
    this.f.permit_document.markAsDirty();
  }

  resetPermitDocument() {
    this.f.permit_document.patchValue(null);
    this.f.permit_document.markAsTouched();
    this.f.permit_document.markAsDirty();
    (this.permitDocumentFileInput.nativeElement as HTMLInputElement).value = '';
  }

  onVisaCopySelected(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.f.visa_copy_document.setValue(file);
    this.f.visa_copy_document.markAsTouched();
    this.f.visa_copy_document.markAsDirty();
  }

  resetVisaCopy() {
    this.f.visa_copy_document.patchValue(null);
    this.f.visa_copy_document.markAsTouched();
    this.f.visa_copy_document.markAsDirty();
    (this.visaCopyFileInput.nativeElement as HTMLInputElement).value = '';
  }

  viewDocument(imagePath: string) {
    const imageURL = this.applicantService.composeImageUrl(imagePath);
    this.applicantService.getImageBlob(imageURL).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const documentSrc = this.sanitizer.bypassSecurityTrustUrl(url) as string;
        this.viewDocument$.next({ hasDocument: true, documentSrc });
      },
      error: (error) => {
        console.log({ error });
        this.viewDocument$.next({ hasDocument: false, documentSrc: '' });
        window.alert('image error.')
      }
    })
  }
}
