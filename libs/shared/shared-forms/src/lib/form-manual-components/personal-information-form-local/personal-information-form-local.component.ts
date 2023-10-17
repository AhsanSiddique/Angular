import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  ApplicantService,
  MetadataResolve,
  MetadataService,
} from '@fan-id/api/server';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';
import { leapYear } from '@fan-id/shared/utils/date';
import { NgbDatepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { interval, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

const EmailRegex = /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;
const arabRegex = /[\u0600-\u06FF]/;

@Component({
  selector: 'fan-id-personal-information-form-local',
  templateUrl: './personal-information-form-local.component.html',
  styleUrls: ['./personal-information-form-local.component.scss']
})
export class PersonalInformationFormLocalComponent
extends FormGroupInput
implements OnInit, OnDestroy,OnChanges {
minDate = undefined;
maxDate = undefined;
minDOBDate = undefined;
maxEXPDate = undefined;
arabMaskPattern = { '0': { pattern: arabRegex } };
nameMaskPattern = { 'S': { pattern: /[a-zA-ZÀ-ÿ]/} }

TICKET_HOLDERS: string[]

constructor(
  private metadataService: MetadataService,
  private config: NgbDatepickerConfig,
  private cd: ChangeDetectorRef,
  private applicantService:ApplicantService
) {
  super();

  this.TICKET_HOLDERS = this.metadataService.getTicketHolders()

  const current = new Date();
  let minday=current.getDate();
  let minmonth =current.getMonth()+1
  let minyear = current.getFullYear()
  if(minmonth === 5 ||minmonth === 7 ||minmonth === 9 ||minmonth === 12 ){
    if(current.getDate() === 30){
      minday = 1
      minmonth = minmonth+1
    }
    else{
      minday = minday+1
      // minmonth = current.getMonth()+1

    }
  }
  else if(current.getMonth() === 2){
    if(leapYear(current.getFullYear())){
      if(current.getDate() === 29){
        minday = 1
        minmonth = minmonth+1
      }
      else{
        minday = minday+1
        // minmonth = current.getMonth()+1
      }
    }
    else{
      if(current.getDate() === 28){
        minday = 1
        minmonth = minmonth+1
      }
      else{
        minday = minday+1
        // minmonth = current.getMonth()+1
      }
    }
  }
  else{
    if(minmonth ===12){
      if(current.getDate() === 31){
        minday = 1
        minmonth = 1
        minyear = current.getFullYear()+1
      }
      else{
        minday = minday+1
        // minmonth = current.getMonth()+1
      }
    }
    else{
        if(current.getDate() === 31){
          minday = 1
          minmonth = minmonth+1
        }
        else{
          minday = minday+1
          // minmonth = current.getMonth()+1
        }
      }
  }
  this.minDate = {
    year: minyear,
    month: minmonth,
    day: minday,
  };
  let maxYear=current.getFullYear();
  let maxMonth = current.getMonth()+1;
  let maxDate = current.getDate();
  if(maxDate ===1){
    if(maxMonth === 1){
      maxYear = maxYear-1;
      maxMonth = 12;
      maxDate = 31;
    }
    else if(maxMonth ===3){
      maxMonth = maxMonth-1
      if(leapYear(current.getFullYear())){
        maxDate = 29
      }
      else{
        maxDate = 28
      }
    }
    else if(maxMonth === 5 || maxMonth == 7 || maxMonth == 9 || maxMonth == 12){
      maxMonth = maxMonth-1
      maxDate = 30;
    }
  }
  else{
    maxDate = maxDate-1
  }
  this.maxDate = {
    // ...this.minDate,
    year: maxYear,
    month: maxMonth,
    day: maxDate,
  };
  this.minDOBDate = {
    year: current.getFullYear() - 200,
    month: 1,
    day: 1,
  };
  this.maxEXPDate = {
    year: current.getFullYear() + 200,
    month: 12,
    day: 31,
  };
}

private readonly unsubscribe$ = new Subject<void>();

@Input() application_type: FormControl;
@Input() fan_category: FormControl;
@Input() nationality: FormControl;
@Input() document_type: FormControl;
@Input() form_type?: string;
@Input() metadata$: Observable<MetadataResolve>;

arab_nationalities: string[];
isNationalityArab = false;
document_number_label = 'Document'

ticket_id_disabled = false;
order_id_disabled = false;

ticketnumberError:boolean = false;
ngOnInit() {
  this.setFormValidators();

  this.arab_nationalities = this.metadataService.getArabNationalities();


  this.document_type.valueChanges
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((val) => {
      if (!val) {
        this.document_number_label = 'Document';
      } else if (val === 3) {
        this.document_number_label = 'Passport';
      } else {
        this.document_number_label = 'QID';
      }

      const document_number_validators =
        val === 1 // QID = 1, Passport = 3
          ? [Validators.required, Validators.pattern(/(2|3)\d{10}/)]
          : [Validators.required];
      this.setFieldValidators(
        this.pf.document_number,
        document_number_validators
      );
      this.cd.detectChanges();

      interval(100)
        .pipe(take(1))
        .subscribe(() => {
          this.pf.document_number.markAsPristine();
          this.cd.detectChanges();
        });
    });

  // this.nationality.valueChanges
  //   .pipe(takeUntil(this.unsubscribe$))
  //   .subscribe((val) => {
  //     if (!val) return;
  //     this.isNationalityArab = this.arab_nationalities.includes(val);

  //     const nameValidators = this.isNationalityArab
  //       ? [Validators.required]
  //       : [];

  //     this.setFieldValidators(this.pf.firstname_ar, nameValidators);
  //     this.setFieldValidators(this.pf.lastname_ar, nameValidators);
  //     this.cd.detectChanges();
  //   });

  // this.pf.ticket_reference_number.valueChanges
  //   .pipe(takeUntil(this.unsubscribe$))
  //   .subscribe(val => {
  //     console.log({val})
  //     if(!val) {
  //       if(this.pf.order_id.disabled) {
  //         console.log(val, '|', 'order_disabled');
  //         this.setFieldValidators(this.pf.order_id, [Validators.required]);
  //         this.pf.order_id.enable({emitEvent: false});
  //         console.log(val, '|', 'order_enabled');
  //       }
  //       return;
  //     }

  //     // reset and disable order_id field since either ticket or order is required
  //     if(!this.pf.order_id.disabled) {
  //       this.pf.order_id.reset();
  //       this.setFieldValidators(this.pf.order_id, []);
  //       this.pf.order_id.disable({emitEvent: false});
  //       this.cd.detectChanges();
  //     }

  //   })

  // this.pf.order_id.valueChanges
  //   .pipe(takeUntil(this.unsubscribe$))
  //   .subscribe(val => {
  //     console.log({val})
  //     if(!val) {
  //       if(this.pf.ticket_reference_number.disabled) {
  //         console.log(val, 'ticket_disabled')
  //         this.setFieldValidators(this.pf.ticket_reference_number, [Validators.required]);
  //         this.pf.ticket_reference_number.enable({emitEvent: false});
  //       }
  //       return;
  //     }

  //     // reset and disable order_id field since either ticket or order is required
  //     if(!this.pf.ticket_reference_number.disabled) {
  //       this.pf.ticket_reference_number.reset()
  //       this.setFieldValidators(this.pf.ticket_reference_number, []);
  //       this.pf.ticket_reference_number.disable({emitEvent: false});
  //       this.cd.detectChanges();
  //     }

  //   })
}

ngOnChanges(changes: SimpleChanges): void{
}

setFormValidators() {
  this.pf.email.setValidators([
    Validators.required,
    Validators.pattern(EmailRegex),
    Validators.maxLength(40)
  ]);

  const name_fields = [
    'firstname',
    'lastname',
  ];
  const required_name_fields = ['firstname', 'lastname'];
  name_fields.forEach((field) => {
    const validators = [
      ...(required_name_fields.includes(field) ? [Validators.required] : []),
      Validators.maxLength(20),
    ];
    this.pf[field].setValidators([...validators]);
  });

  this.formGroup.updateValueAndValidity();
}

get pf() {
  return this.formGroup.controls;
}

get nationalitySearchFn() {
  return nationalitySearchFn
}

setFieldValidators(
  field: AbstractControl,
  validators: ValidatorFn | ValidatorFn[]
) {
  field.setValidators(validators);
  field.updateValueAndValidity({ onlySelf: true, emitEvent: false });
}

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  tickeRefBlur(){
    this.ticketnumberError = false;
    if(this.pf.ticket_reference_number.value){
      this.applicantService.CustomerPortalValidateTicket(this.pf.ticket_reference_number.value).subscribe(response=>{
        // this.pf.ticket_reference_number.setErrors(null)
      },
      err=>{
        this.ticketnumberError = true;
        this.pf.ticket_reference_number.setErrors({notValidTicket:true})
      })
    }
    // else{
    //   this.pf.ticket_reference_number.setErrors(null)
    // }
  }
  tickeRefFocus(event){
    if ( this.pf.ticket_reference_number.hasError('notValidTicket') ) {
      const { notValidTicket, ...errors } = this.pf.ticket_reference_number.errors;
      this.pf.ticket_reference_number.setErrors(errors);
      this.pf.ticket_reference_number.updateValueAndValidity();
    }
  }

  docRefBlur(){
    if(this.pf.document_number.value){
      let body={
        type:"doc",
        documentNo: this.document_type?.value+"-"+this.pf.document_number.value,
        refNationality_Code: this.nationality.value,
        eventcode:localStorage.getItem('eventCode'),
        customerCategoryCode: ''
      }
      this.applicantService.customerPortalValidateEmailPhoneDocument(body).subscribe(response=>{
        // this.pf.document_number.setErrors(null)
      },
      err=>{
        this.pf.document_number.setErrors({notValidDoc:true})
      })
    }
    // else{
    //   this.pf.document_number.setErrors(null)
    // }
  }
  docRefFocus(event){
    if ( this.pf.document_number.hasError('notValidDoc') ) {
      const { notValidDoc, ...errors } = this.pf.document_number.errors;
      this.pf.document_number.setErrors(errors);
      this.pf.document_number.updateValueAndValidity();
    }
  }

  phoneRefBlur(){
    if(this.pf.phonecode.value && this.pf.mobile.value){
      let body={
        type:"phone",
        phone: this.pf.phonecode.value+"-"+this.pf.mobile.value,
        eventcode:localStorage.getItem('eventCode'),
        customerCategoryCode: ''
      }
      this.applicantService.customerPortalValidateEmailPhoneDocument(body).subscribe(response=>{
        // this.pf.mobile.setErrors(null)
      },
      err=>{
        this.pf.mobile.setErrors({notValidPhone:true})
      })
    }
    // else{
    //   this.pf.document_number.setErrors(null)
    // }
  }
  phoneRefFocus(){
    if ( this.pf.mobile.hasError('notValidPhone') ) {
      const { notValidPhone, ...errors } = this.pf.mobile.errors;
      this.pf.mobile.setErrors(errors);
      this.pf.mobile.updateValueAndValidity();
    }
  }

  onPhoneCodeChange() {
    this.phoneRefFocus();
    this.phoneRefBlur();
  }

  emailRefBlur(){
    if(this.pf.email.value){
      let body={
        type:"email",
        email: this.pf.email.value,
        eventcode:localStorage.getItem('eventCode'),
        customerCategoryCode: ''
      }
      this.applicantService.customerPortalValidateEmailPhoneDocument(body).subscribe(response=>{
        // this.pf.email.setErrors(null)
      },
      err=>{
        this.pf.email.setErrors({notValidEmail:true})
      })
    }
    // else{
    //   this.pf.email.setErrors(null)
    // }
  }
  emailRefFocus(event){
    if ( this.pf.email.hasError('notValidEmail') ) {
      const { notValidEmail, ...errors } = this.pf.email.errors;
      this.pf.email.setErrors(errors);
      this.pf.email.updateValueAndValidity();
    }
  }
}
