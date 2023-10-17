import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import {
  ActiveConferenceEvent,
  ActiveConferenceEventListResponse,
  BulkGroupService,
  BulkRegistrationService,
  MetaDataLookup,
  MetadataCustomerCategory,
  MetadataService,
  OrganizationService,
} from "@fan-id/api/server";
import { MenuService } from "@fan-id/core";
import { getFromLocalStorage } from "@fan-id/shared/utils/common";
import { ACCOMMODATION_DETAILS_VALIDATORS, B2BVisaType, filterConferenceEventListByOrganization, filterHayyaVisitCategoryByOrganization, getB2BVisaType, getControlListValid$, onUniqueFieldBlur, onUniqueFieldFocus } from "@fan-id/shared/utils/form";
import { BehaviorSubject, EMPTY, Observable, Subject, of } from "rxjs";
import { catchError, distinctUntilChanged, first, map, startWith, take, takeUntil } from "rxjs/operators";

export interface ManualStepOneForm {
  eventname: string;
  organizationname: string;
  bulkgroupname: string;
  numberofapplication: string;
  servicecentre: string;
  deliverytype: string;
  organization: any;
  continue: boolean;
  failedList?: any[];
  OrgGroupAccommodationAddress: string;
  hayyaVisitCategory: string;
  conferenceId: number;
  user_category: string;
}

@Component({
  selector: "fan-id-manual-upload-step1",
  templateUrl: "./manual-upload-step1.component.html",
  styleUrls: ["./manual-upload-step1.component.scss"],
})
export class ManualUploadStep1Component implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private bulkService: BulkRegistrationService,
    private bulkGroupService: BulkGroupService,
    private menuService: MenuService,
    private organizationService: OrganizationService,
    private metadataService: MetadataService
  ) {
  }

  manualRegistrationForm: FormGroup;
  organizationName = "";
  show_cancel_modal = false;
  events: any;
  organizations: any;
  servicecentres: any;
  eventSelected: any;
  userOrganizationId = 0;
  onUniqueFieldFocus = onUniqueFieldFocus;

  private readonly unsubscribe$ = new Subject<void>();
  hayyaVisitCategories$: Observable<MetaDataLookup[]>;
  conferenceEventList$: Observable<ActiveConferenceEvent[]>;
  userCategories$: Observable<MetaDataLookup[]>;
  b2bVisaType$: BehaviorSubject<B2BVisaType> = new BehaviorSubject<B2BVisaType>('TRANSIT');
  section1Valid$: Observable<boolean>;
  section2Valid$: Observable<boolean>;

  ngOnInit(): void {
    this.manualRegistrationForm = this.fb.group({
      eventname: [null, Validators.required],
      organizationname: [null, Validators.required],
      bulkgroupname: [
        "",
        [
          Validators.required,
          Validators.maxLength(60),
          Validators.pattern('^[a-zA-Z0-9 ]*$')
        ],
      ],
      deliverytype: [null],
      servicecentre: [null],
      accodetails:['', ACCOMMODATION_DETAILS_VALIDATORS],
      hayyaVisitCategory: [null, Validators.required],
      conferenceId: [null],
      user_category: [null],
    });
    this.userOrganizationId = parseInt(localStorage.getItem('organizationId'));
    this.setSectionValidations();
    this.setListeners();
    this.setOrganizationValues();

    this.bulkService
      .getEvents()
      .pipe(first())
      .subscribe(
        (data: any) => {
          this.eventSelected = this.menuService.getSelectedEventCode();
          this.events = data?.dataList ?? [
            {code: this.eventSelected, name: this.menuService.getSelectedEvent()},
          ];
          this.manualRegistrationForm.controls["eventname"].patchValue(
            this.eventSelected
          );
        },
        (error) => console.error(error)
      );

    this.bulkGroupService
      .getOrganization(this.userOrganizationId)
      .pipe(first())
      .subscribe(
        (response) => {
          this.organizations = [response?.data];
          this.manualRegistrationForm.controls["organizationname"].patchValue(this.userOrganizationId);
        },
        (error) => console.error(error)
      );

    this.organizationName = "";
  }

  get f() {
    return this.manualRegistrationForm.controls;
  }

  get deliveryType() {
    return this.manualRegistrationForm.get("deliverytype");
  }

  get serviceCentre() {
    return this.manualRegistrationForm.get("servicecentre");
  }

  get bulkgroupname() {
    return this.manualRegistrationForm.get("bulkgroupname");
  }

  get organizationname() {
    return this.manualRegistrationForm.get("organizationname");
  }

  get accomadationDetails(){
    return this.manualRegistrationForm.get("accodetails");
  }

  setSectionValidations() {
    const section1ControlNames = ['bulkgroupname', 'accodetails'].map((controlName) => this.f[controlName]);
    this.section1Valid$ = getControlListValid$(section1ControlNames);
    const section2ControlNames = ['hayyaVisitCategory', 'conferenceId'].map((controlName) => this.f[controlName]);
    this.section2Valid$ = getControlListValid$(section2ControlNames);
  }

  setListeners() {
    this.f.hayyaVisitCategory.valueChanges.pipe(
      startWith(this.f.hayyaVisitCategory.value),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: (val) => {
        const b2bVisaType = getB2BVisaType(val);
        this.b2bVisaType$.next(b2bVisaType);
        const controlNames = ['conferenceId'] as const;
        if (b2bVisaType === 'TRANSIT' || b2bVisaType === 'VISA') {
          controlNames.forEach((controlName) => {
            this.f[controlName].clearValidators();
            this.f[controlName].patchValue(null);
            this.f[controlName].updateValueAndValidity();
            this.f[controlName].markAsUntouched();
          });
        } else {
          controlNames.forEach((controlName) => {
            this.f[controlName].setValidators(Validators.required);
            this.f[controlName].updateValueAndValidity();
          });
        }
      }
    });
  }

  setOrganizationValues() {
    const organizationHayyaVisitCategories: { id: number, code: string }[] = getFromLocalStorage({
      key: "organizationCustomerCategoryIdAndCode",
      parse: true,
    });
    if (organizationHayyaVisitCategories.length === 1) {
      this.f.hayyaVisitCategory.patchValue(organizationHayyaVisitCategories[0].code);
      this.f.hayyaVisitCategory.disable();
    }
  }

  redirectTo(path) {
    this.router.navigate(["/main/manual-registration/" + path]);
  }

  onSubmit() {
    console.log(this.manualRegistrationForm.value);

    if (this.manualRegistrationForm.invalid) {
      return;
    }

    const control = this.bulkgroupname;
    const value = control.value;
    if(value) {
      const body = {
        refOrganization_Id: this.userOrganizationId,
        bulkGroupName: value,
        refTournament_Code: localStorage.getItem('eventCode')
      }
      const service$ = this.bulkService.validateBulkGroupName(body);
      service$
      .pipe(take(1), catchError(err => {
        console.log({err})
        control.setErrors({ notUnique:true });
        return EMPTY
      }))
      .subscribe((response) => {
        if (control.hasError('notUnique')) return;
        if (response?.status !== 200) {
          control.setErrors({ notUnique:true });
          return;
        }
        const form_value = this.manualRegistrationForm.getRawValue();
        form_value.OrgGroupAccommodationAddress = form_value.accodetails;
        delete form_value.accodetails;
        const organization = this.organizations.find(org => org.id == form_value.organizationname)
        this.router.navigate(
          ["main/bulk-registration/manual-registration/step-2"],
          {
            state: {
              manualStepOneFormData: {
                ...form_value,
                organization,
                continue: false
              } as ManualStepOneForm
            }
          }
        );
      })
    }
  }

  cancel() {
    this.router.navigate(["/main/bulk-registration"]);
  }

  onBulkGroupNameBlur() {
    const control = this.bulkgroupname;
    const value = control.value;
    if(value){
      const body = {
        refOrganization_Id: this.userOrganizationId,
        bulkGroupName: value,
        refTournament_Code: localStorage.getItem('eventCode')

      }
      const service$ = this.bulkService.validateBulkGroupName(body);
      onUniqueFieldBlur(control, service$);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
