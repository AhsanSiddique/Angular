import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApplicantService, MetadataResolve } from '@fan-id/api/server';
import { MenuService } from '@fan-id/core';
import { EValidateAPIType, getFormExtras, HiddenTicketTypeCodes, IFormExtras, ITicketType, TicketTypes } from '@fan-id/shared/utils/form';
import { EMPTY, Observable, Subject } from 'rxjs';
import { take, catchError, startWith, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-ticket-information-form',
  templateUrl: './ticket-information-form.component.html',
  styleUrls: ['./ticket-information-form.component.scss']
})
export class TicketInformationFormComponent extends FormGroupInput implements OnInit, OnDestroy {
  @Input() metadata$: Observable<MetadataResolve>;
  ticketTypes = TicketTypes.filter(({ code }) => !HiddenTicketTypeCodes.includes(code));
  private readonly unsubscribe$ = new Subject<void>();
  formExtras: IFormExtras;

  constructor(
    private applicantService: ApplicantService,
    private route: ActivatedRoute,
    private menuService: MenuService
  ) {
    super();
  }

  ngOnInit() {
    this.formExtras = getFormExtras(this.parentForm);
    this.f.ticket_type.valueChanges.pipe(startWith(this.f.ticket_type.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (ticket_type: ITicketType) => {
          this.setTicketRequiredValidators(ticket_type?.ticketRequired);
          this.setPurposeVisitValidators(ticket_type?.purposeOfVisitExcluded);
        }
      })

    this.f.purpose_visit.valueChanges.pipe(startWith(this.f.purpose_visit.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (purpose_visit: string) => {
          this.setPurposeVisitOtherValidators(purpose_visit === 'OTE');
        }
      });
  }

  setTicketRequiredValidators(ticketRequired = false) {
    if (ticketRequired) {
      this.f.ticket_number.setValidators([Validators.required]);
      this.f.ticket_number.updateValueAndValidity();
    } else {
      this.f.ticket_number.clearValidators();
      this.f.ticket_number.updateValueAndValidity();
      this.f.ticket_valid.patchValue(true);
    }
  }

  setPurposeVisitValidators(purposeOfVisitExcluded = false) {
    if (!purposeOfVisitExcluded && this.formExtras.applicationType === 'VISA') {
      this.f.purpose_visit.setValidators([Validators.required]);
      this.f.purpose_visit.updateValueAndValidity();
    } else {
      this.f.purpose_visit.clearValidators();
      this.f.purpose_visit.updateValueAndValidity();
    }
  }

  setPurposeVisitOtherValidators(purposeVisitOther = false) {
    const purposeOfVisitExcluded = this.f.ticket_type.value?.purposeOfVisitExcluded;
    if (!purposeOfVisitExcluded && purposeVisitOther && this.formExtras.applicationType === 'VISA') {
      this.f.purpose_visit_other.setValidators([Validators.required]);
      this.f.purpose_visit_other.updateValueAndValidity();
    } else {
      this.f.purpose_visit_other.clearValidators();
      this.f.purpose_visit_other.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get f() {
    return this.formGroup.controls;
  }

  get form_invalid() {
    return this.f.ticket_type.invalid || this.f.ticket_number.invalid;
  }

  onTicketNumberChanged() {
    this.f.ticket_valid.patchValue(false);
    this.f.ticket_valid.markAsUntouched();
  }

  validateTicket() {
    if(this.formGroup.disabled) return;
    const { ticket_number, ticket_type } = this.formGroup.getRawValue();
    const personalInfoForm = this.parentForm.get('personalInfoForm') as FormGroup;
    const categoryCode = ticket_type?.code;
    const email = personalInfoForm?.controls?.email?.value;
    const fanid = this.route.snapshot.queryParamMap.get('fanid');
    const voucherExtras = {
      ...(categoryCode && { categoryCode }),
      ...(email && { email }),
      refEvent_Code: this.menuService.getSelectedEventCode(),
      ...(fanid && { fanid })
    }
    const orderIdExtras = {
      ...(categoryCode && { categoryCode }),
      ...(fanid && { fanid })
    }
    const services: Partial<{[key in EValidateAPIType]: Observable<unknown>}> = {
      // ticket_number: this.applicantService.ValidateTicket(ticket_number),
      ticket: this.applicantService.ValidateOrderID(ticket_number, orderIdExtras),
      voucher: this.applicantService.ValidateVoucherCode(ticket_number, voucherExtras),
      hayyaVoucher: this.applicantService.ValidateHayyaVoucherCode(ticket_number, voucherExtras),
      // hospitality_number: this.applicantService.ValidateHospitalityCode(ticket_number),
    }
    const service$ = services[(ticket_type as ITicketType)?.validateAPIType];
    if(service$) {
      service$.pipe(
        take(1),
        catchError((err) => {
          console.log({ err });
          this.f.ticket_valid.patchValue(false);
          this.f.ticket_valid.markAsTouched();
          return EMPTY;
        })
      )
      .subscribe(response => {
        if(response) {
          this.f.ticket_valid.patchValue(true);
          this.f.ticket_valid.markAsTouched();
        }
      })
    }
  }
}
