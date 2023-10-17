import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllApplicationsService, ApplicantService, MetadataParams, MetadataResolve, MetadataService, NationalityLookup } from '@fan-id/api/server';
import { MenuService } from '@fan-id/core';
import { EValidateAPIType, HiddenTicketTypeCodes, ITicketType, TicketTypes } from '@fan-id/shared/utils/form';
import { EMPTY, Observable, Subject } from 'rxjs';
import { catchError, startWith, take, takeUntil } from 'rxjs/operators';
@Component({
  selector: 'fan-id-update-fan-category',
  templateUrl: './update-fan-category.component.html',
  styleUrls: ['./update-fan-category.component.scss']
})
export class UpdateFanCategoryComponent implements OnInit {

  @Output() closeThis = new EventEmitter();
  @Input() data:any;
  @Input() metadata$: Observable<MetadataResolve>;
  @Output() submitData = new EventEmitter<any>()
  countries: Observable<any[]>;
  ticketTypes = TicketTypes.filter(({ code }) => !HiddenTicketTypeCodes.includes(code));
  private readonly unsubscribe$ = new Subject<void>();
  
  updateFanCategoryForm!: FormGroup;
  metaDataLookupParam: MetadataParams = {};
  countryCode:any;
  codeFieldName = 'Application Number'
  errorVal:boolean;
  constructor(private fb: FormBuilder,
    private metadataService: MetadataService,
    private aps: AllApplicationsService,
    private menuService: MenuService,
    private applicantService: ApplicantService,
    ) { }

  ngOnInit(): void {
    this.ticketTypes = this.ticketTypes.filter(x=>x.code !== 'ACP')
    if(this.ticketTypes.filter(x=>x.name === this.data.customerCategory_Name).length>0)
    {
    this.updateFanCategoryForm = this.fb.group({
      ticket_type: [this.ticketTypes.filter(x=>x.name === this.data.customerCategory_Name)[0]],
      ticket_number: [this.data [this.ticketTypes.filter(x=>x.name === this.data.customerCategory_Name)[0].ticketField]],
    })
  }
  else{

    this.updateFanCategoryForm = this.fb.group({
      ticket_type: [this.ticketTypes.filter(x=>x.code === 'NHWM')[0]],
      ticket_number: [this.data [this.ticketTypes.filter(x=>x.code === 'NHWM')[0].ticketField]],
    })
  }

    this.f.ticket_type.valueChanges.pipe(startWith(this.f.ticket_type.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (ticket_type: ITicketType) => {
          if (ticket_type?.ticketRequired) {
            this.f.ticket_number.setValidators([Validators.required]);
            this.f.ticket_number.updateValueAndValidity();
          } else {
            this.f.ticket_number.clearValidators();
            this.f.ticket_number.updateValueAndValidity();
            this.f.ticket_valid.patchValue(true);
          }
        }
      })
  }

  get f() {
    return this.updateFanCategoryForm.controls;
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
  get form_invalid() {
    return this.f.ticket_type.invalid || this.f.ticket_number.invalid;
  }

  onTicketNumberChanged() {
    this.f.ticket_valid.patchValue(false);
    this.f.ticket_valid.markAsUntouched();
  }

  validateTicket() {
    if(this.f.disabled) return;
    const { ticket_number, ticket_type } = this.updateFanCategoryForm.getRawValue();
    const categoryCode = ticket_type?.code;
    const email = this.data.email;
    const fanid = this.data.fanIdNo;
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
      hospitality_number: this.applicantService.ValidateHospitalityCode(ticket_number),
    }
    const service$ = services[(ticket_type as ITicketType)?.validateAPIType];
    if(service$) {
      service$.pipe(
        take(1),
        catchError((err) => {
          console.log({ err });
          this.errorVal = true;
          this.f.ticket_valid.patchValue(false);
          this.f.ticket_valid.markAsTouched();
          return EMPTY;
        })
      )
      .subscribe(response => {
        if(response) {
          this.errorVal = false;
          const body={
            fanIdNo: this.data.fanIdNo,
            refTicketNumber:ticket_number,
            customerCategoryCode:ticket_type?.code
            }
          this.submitData.emit(body);
          this.f.ticket_valid.patchValue(true);
          this.f.ticket_valid.markAsTouched();
        }
      })
    }
    else{
      const body={
        fanIdNo: this.data.fanIdNo,
        refTicketNumber:ticket_number,
        customerCategoryCode:ticket_type?.code
        }
      this.submitData.emit(body);
    }
  }

  changecategory(){
    this.errorVal = false;
  }

}
