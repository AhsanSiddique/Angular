import {
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  ApplicantService,
  MetadataResolve,
  MetadataService,
} from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';
import {
  IFormExtras,
  MASK_PATTERNS,
  arabicNameValidator,
  onUniqueFieldBlur,
  onUniqueFieldFocus,
} from '@fan-id/shared/utils/form';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { catchError, startWith, take, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

const EmailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,20})$/;
// const arabRegex = /[\u0600-\u06FF]/;
// const arabRegex = /[\u0600-\u06ff]|[\u0750-\u077f]|[\ufb50-\ufbc1]|[\ufbd3-\ufd3f]|[\ufd50-\ufd8f]|[\ufd92-\ufdc7]|[\ufe70-\ufefc]|[\uFDF0-\uFDFD]/;
const arabRegex = /[\u0621-\u064A\040]/;

@Component({
  selector: 'fan-id-personal-information-form',
  templateUrl: './personal-information-form.component.html',
  styleUrls: ['./personal-information-form.component.scss'],
})
export class PersonalInformationFormComponent
  extends FormGroupInput
  implements OnInit, OnDestroy {
  arabMaskPattern = { '0': { pattern: arabRegex } };
  nameMaskPattern = { 'S': { pattern: /[-.a-zA-ZÀ-ÿ]/ } };
  documentMask = 'A*';
  titleEnMask = MASK_PATTERNS.EnglishWithSpaces;
  titleArMask = MASK_PATTERNS.ArabicWithSpaces;

  TICKET_HOLDERS: string[];
  VOUCHER_HOLDERS: string[];
  isServiceCenter = false;

  onUniqueFieldFocus = onUniqueFieldFocus;

  constructor(
    private metadataService: MetadataService,
    private config: NgbDatepickerConfig,
    @Inject(FanIDConfig) private appconfig: Environment,
    private cd: ChangeDetectorRef,
    private applicantService: ApplicantService,
    private route: ActivatedRoute
  ) {
    super();

    this.TICKET_HOLDERS = this.metadataService.getTicketHolders();
    this.VOUCHER_HOLDERS = this.metadataService.getVoucherHolders();
    this.isServiceCenter = this.appconfig.application === 'ServiceCenter';
  }

  private readonly unsubscribe$ = new Subject<void>();

  @Input() application_type: FormControl;
  @Input() fan_category: FormControl;
  @Input() user_category: FormControl;
  @Input() nationality: FormControl;
  @Input() document_type: FormControl;
  @Input() form_type?: string;
  @Input() metadata$: Observable<MetadataResolve>;
  @Input() isDependent?: boolean = false;
  @Input() editApp?: boolean = false;
  @Input() isExcel?: boolean = false;
  @Input() draftId?: string;

  arab_nationalities: string[];
  isNationalityArab = false;
  isNationalityTravelDocumentArabic = false;
  document_number_label = 'Document';

  docChangeChecker = '';
  natChangeChecker = '';
  docEditAppcounter = 0;
  natEditAppcounter = 0;
  editDocNumber = 0;
  editNat: string;
  editDocType: string;
  editNatChangeChecker: string;
  editDocChangeChecker: string;
  expDateDisable = false;

  tooltips = {
    phonecode: 'Qatar: +974',
    contactcode: 'Qatar: +974'
  }
  mobilefocus = false;
  emobilefocus = false;

  private _accreditationPersonalTitleConfig = { hasServiceRule: false, required: false };
  accreditationPersonalTitleConfig$ = new BehaviorSubject(this._accreditationPersonalTitleConfig);

  get accreditationPersonalTitleConfig() {
    return this._accreditationPersonalTitleConfig;
  }

  set accreditationPersonalTitleConfig(val) {
    this._accreditationPersonalTitleConfig = val;
    this.accreditationPersonalTitleConfig$.next(val);
  }

  get pf() {
    return this.formGroup.controls;
  }

  get nationalitySearchFn() {
    return nationalitySearchFn;
  }

  get isVIP() {
    return this.fan_category.value === 'VIP';
  }

  ngOnInit() {
    this.setFormValidators();
    this.setArabNationality();
    this.setInitialTooltips();

    this.document_type.valueChanges
      .pipe(startWith(this.document_type?.value), takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.setEmergencyContactValidators(val);
        if (!val) {
          this.document_number_label = 'Document';
        } else {
          this.editDocChangeChecker = val;
          if (this.editApp) {
            this.docEditAppcounter++;
            if (this.docEditAppcounter === 1) {
              this.editDocType = val;
            }
            if (this.docChangeChecker !== val && this.docEditAppcounter > 1) {
              this.docChangeChecker = val;
            }
          } else if (this.docChangeChecker !== val) {
            this.docChangeChecker = val;
          }

          if (val === 3) {
            this.expDateDisable = false;
            this.document_number_label = 'Passport';
          } else {
            this.document_number_label = 'QID';
          }
        }
      });

    this.nationality.valueChanges
      .pipe(startWith(this.nationality?.value), takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        if (!val || this.isVIP) return;
        else {
          this.editNatChangeChecker = val;
          if (this.editApp) {
            this.natEditAppcounter++;
            if (this.natEditAppcounter === 1) {
              this.editNat = val;
            }
            if (this.natChangeChecker !== val && this.natEditAppcounter > 1) {
              this.natChangeChecker = val;
            }
          } else if (this.natChangeChecker !== val) {
            this.natChangeChecker = val;
          }
        }

        this.isNationalityArab = this.arab_nationalities.includes(val);
        this.isNationalityTravelDocumentArabic = val === 'XR';

        const nameValidators = (this.isNationalityArab || this.isNationalityTravelDocumentArabic)
          ? [Validators.required, Validators.maxLength(20), arabicNameValidator()]
          : [Validators.maxLength(20)];

        this.setFieldValidators(this.pf.firstname_ar, nameValidators);
        this.setFieldValidators(this.pf.lastname_ar, nameValidators);
        this.cd.detectChanges();
      });

    this.fan_category?.valueChanges
      .pipe(startWith(this.fan_category?.value), takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        if (val && this.pf.email.value && !this.isServiceCenter) {
          this.onEmailBlur();
        }
      });

    this.pf.title?.valueChanges
      .pipe(startWith(this.pf.title?.value), takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        if (this.isServiceCenter) return;
        if (val === 'OTHR') {
          this.pf.titleAR?.setValidators([Validators.required, Validators.maxLength(24)]);
          this.pf.titleEN?.setValidators([Validators.required, Validators.maxLength(24)]);
        } else {
          this.pf.titleAR?.clearValidators();
          this.pf.titleEN?.clearValidators();
        }
        this.pf.titleAR?.updateValueAndValidity();
        this.pf.titleEN?.updateValueAndValidity();
      });

    this.accreditationPersonalTitleConfig$.pipe(takeUntil(this.unsubscribe$)).subscribe((config) => {
      const { hasServiceRule, required } = config;
      if (required) {
        this.pf.title.setValidators([Validators.required]);
      } else {
        this.pf.title.clearValidators();
      }
      this.pf.title.updateValueAndValidity();
    })

    this.parentForm?.get('extras')?.valueChanges
      .pipe(startWith(this.parentForm?.get('extras')?.value), takeUntil(this.unsubscribe$))
      .subscribe((extras: IFormExtras) => {
        if (this.isServiceCenter) return;
        console.log({ extras });
        const personalTitleHasServiceRule = extras?.accreditationPersonalTitleHasServiceRule;
        const personalTitleRequired = extras?.accreditationPersonalTitleRequired;
        this.accreditationPersonalTitleConfig = { hasServiceRule: personalTitleHasServiceRule, required: personalTitleRequired };
      })
  }

  setFormValidators() {
    this.pf.email.setValidators([
      Validators.required,
      Validators.pattern(EmailRegex),
      Validators.maxLength(40),
    ]);

    const name_fields = [
      'firstname',
      'secondname',
      'thirdname',
      'fourthname',
      'lastname',
      'firstname_ar',
      'secondname_ar',
      'thirdname_ar',
      'fourthname_ar',
      'lastname_ar',
    ];
    const required_name_fields = ['firstname', 'lastname'];
    name_fields.forEach((field) => {
      const validators = [
        ...(required_name_fields.includes(field) ? [Validators.required] : []),
        Validators.maxLength(20),
        ...(field.includes('_ar') ? [arabicNameValidator()] : []),
      ];
      this.pf[field].setValidators([...validators]);
    });

    this.formGroup.updateValueAndValidity();
  }

  setArabNationality() {
    this.arab_nationalities = this.metadataService.getArabNationalities();
  }

  setEmergencyContactValidators(docType: number) {
    const validators = (this.isServiceCenter && docType !== 1) ? {
      contactname: [Validators.required, Validators.maxLength(24)],
      contactnumber: [Validators.required, Validators.maxLength(20)],
      contactcode: [Validators.required],
      pf: []
    } : {};
    this.setFieldValidators(this.pf.contactname, validators.contactname ?? []);
    this.setFieldValidators(this.pf.contactnumber, validators.contactnumber ?? []);
    this.setFieldValidators(this.pf.contactcode, validators.contactcode ?? []);
    this.setFieldValidators(this.formGroup, validators.pf ?? []);
  }

  setFieldValidators(
    field: AbstractControl | FormGroup,
    validators: ValidatorFn | ValidatorFn[]
  ) {
    field.setValidators(validators);
    field.updateValueAndValidity({ emitEvent: false });
  }

  onMTHFieldFocus(control: FormControl) {
    const MTHFields = ['ticket_reference_number', 'order_id'];
    for (const field of MTHFields) {
      const _control = this.pf[field];
      if (control !== _control) {
        _control.patchValue('');
      }
      if (_control.hasError('invalidMTH')) {
        const { invalidMTH, ...errors } = _control.errors;
        _control.setErrors(errors);
        _control.updateValueAndValidity();
      }
    }
  }

  onMTHFieldBlur(control: AbstractControl, service$: Observable<any>) {
    service$
      .pipe(
        take(1),
        catchError((err) => {
          console.log({ err });
          control.setErrors({ invalidMTH: true });
          return EMPTY;
        })
      )
      .subscribe();
  }

  // onTicketBlur() {
  //   const control = this.pf.ticket_reference_number;
  //   const value = control.value;
  //   if (value) {
  //     const service$ = this.applicantService.ValidateTicket(value);
  //     this.onMTHFieldBlur(control, service$);
  //   }
  // }

  // onOrderIdBlur() {
  //   const control = this.pf.order_id;
  //   const value = control.value;
  //   if (value) {
  //     const service$ = this.applicantService.ValidateOrderID(value);
  //     this.onMTHFieldBlur(control, service$);
  //   }
  // }

  // onVoucherCodeBlur() {
  //   const control = this.pf.voucher_code;
  //   const value = control.value;
  //   if (value) {
  //     const service$ = this.applicantService.ValidateVoucherCode(value);
  //     this.onMTHFieldBlur(control, service$);
  //   }
  // }

  onEmailBlur() {
    if (this.isDependent || this.editApp) {
      return;
    }
    const control = this.pf.email;
    const value = control.value;
    if (value) {
      const fanIdNo = this.route.snapshot.queryParamMap.get('fanid');
      // const category = this.isServiceCenter ?
      //   { customerCategoryCode: this.fan_category.value } : { userCategoryCode: this.user_category.value };
      const userCategoryCode = this.b2bVisaType === 'TRANSIT' ? 'TRV' : this.user_category.value;
      const categories = { userCategoryCode, customerCategoryCode: this.fan_category.value };
      const body = {
        type: 'email',
        email: value,
        eventcode: localStorage.getItem('eventCode'),
        ...(this.draftId && { draftId: +this.draftId }),
        ...categories,
        ...(fanIdNo && { fanIdNo })
      };
      const service$ = this.applicantService.customerPortalValidateEmailPhoneDocument(
        body
      );
      onUniqueFieldBlur(control, service$);
    }
  }

  onPhoneNumberBlur() {
    if (this.isDependent || this.isVIP || !this.isServiceCenter || this.editApp) {
      return;
    }
    const control = this.pf.mobile;
    const value = control.value;
    const code = this.pf.phonecode.value;
    if (code && value) {
      const body = {
        type: 'phone',
        phone: code + '-' + value,
        eventcode: localStorage.getItem('eventCode'),
        customerCategoryCode: this.user_category.value,
      };
      const service$ = this.applicantService.customerPortalValidateEmailPhoneDocument(
        body
      );
      onUniqueFieldBlur(control, service$);
    }
  }

  onPhoneCodeChange() {
    this.setTooltip('phonecode', this.pf.phonecode.value);
    if (this.isDependent || !this.isServiceCenter || this.editApp) {
      return;
    }
    this.onUniqueFieldFocus(this.pf.mobile);
    this.onPhoneNumberBlur();
  }

  onContactCodeChange() {
    this.setTooltip('contactcode', this.pf.contactcode.value);
  }

  onNameChange(event: any, field: string) {
    const value = event.target.value;
    if(!value) {
      let fields = ['secondname', 'thirdname', 'fourthname'];
      const is_field_arabic = field.includes('_ar');
      if(is_field_arabic) { fields = fields.map(f => f + '_ar'); }
      const index = fields.indexOf(field);
      if (index === -1) return;
      fields.filter((_field, _index) => {
        return _index > index;
      }).forEach(_field => {
        this.pf[_field].setValue('');
      })
    }
  }

  setTooltip(field: string, value: string) {
    if(field in this.tooltips) this.tooltips[field] = value;
  }

  setInitialTooltips() {
    this.setTooltip('phonecode', this.pf.phonecode?.value);
    this.setTooltip('contactcode', this.pf.contactcode?.value);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
