import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ActiveConferenceEvent, ActiveConferenceEventListResponse, ConferenceApplicationRulesListResponse, ConferenceEventProfileResponse, ConferencesByCodeResponse, MetadataResolve, MetadataService, OrganizationService } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { catchError, distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';
import { ITicketType, TicketTypes, getB2BVisaType, getConferenceType, setContactFormInitialValidators, updateFormExtras } from '@fan-id/shared/utils/form';
import { FormGroup, Validators } from '@angular/forms';
import { getFromLocalStorage } from '@fan-id/shared/utils/common';

@Component({
  selector: 'fan-id-application-form',
  templateUrl: './application-form.component.html',
  styleUrls: ['./application-form.component.scss'],
})
export class ApplicationFormComponent extends FormGroupInput implements OnInit {
  @Input() metadata$:Observable<MetadataResolve>;
  @Input() isExcel? = false;
  @Input() disableQRC = true;
  @Output() clearSwitchData = new EventEmitter();
  isServiceCentre: boolean;
  private readonly unsubscribe$ = new Subject<void>();
  hayyaCategories$ = new BehaviorSubject<any[]>([]); // applicant category
  hayyaCategoriesAll$ = new BehaviorSubject<any[]>([]);
  conferenceEventList$ = new BehaviorSubject<ActiveConferenceEvent[]>([]);
  hayyaVisitCategories$ = new BehaviorSubject<any[]>([]);
  selectedHayyaVisitCategory$ = new BehaviorSubject<any | null>(null);
  selectedFanCategory$ = new BehaviorSubject<ITicketType>(null);
  conferenceProfileList$ = new BehaviorSubject<ConferenceEventProfileResponse[]>([]);
  conferenceProfileListLoading$ = new BehaviorSubject<boolean>(false);

  constructor(
    @Inject(FanIDConfig) private appconfig: Environment,
    private metadata: MetadataService,
    private organizationService: OrganizationService,
    private cd: ChangeDetectorRef
  ) {
    super();
    this.isServiceCentre = appconfig.application === 'ServiceCenter';
    if (!this.isServiceCentre) {
      this.metadata.getRegUserCategories({}).subscribe({
        next: (categories) => {
          this.hayyaCategories$.next(categories);
          this.hayyaCategoriesAll$.next(categories);
        }
      });
      this.getConferenceEventList().subscribe({
        next: (conferenceEventList) => {
          this.conferenceEventList$.next(conferenceEventList);
        }
      });
      this.metadata.getMetaDataCustomerCategory({}).subscribe({
        next: (categories) => {
          this.hayyaVisitCategories$.next(categories);
        }
      });
    }
  }

  ngOnInit(): void {
    this.setInitialValidators();

    this.application_type.valueChanges
      .pipe(distinctUntilChanged(),takeUntil(this.unsubscribe$))
      .subscribe(val => {
        console.log({ application_type: val });
        this.clearSwitchData.emit(val);
      });

    this.selectedFanCategory$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (category) => {
        if (this.isServiceCentre) return;
        console.log({ pve: category?.purposeOfVisitExcluded });
        this.setPurposeVisitValidators(category?.purposeOfVisitExcluded);
      }
    })

    this.fan_category.valueChanges
      .pipe(startWith(this.fan_category.value),distinctUntilChanged(),takeUntil(this.unsubscribe$))
      .subscribe({
        next: code => {
          if (this.isServiceCentre) return;
          try {
            // TRANSIT is equivalent to OLD flow
            console.log('fanCategory', code);
            const b2bVisaType = getB2BVisaType(code);
            updateFormExtras(this.parentForm, { b2bVisaType });
            // reset validations
            const { residencyForm, applicationForm, contactForm } = this.parentForm.controls as { [key: string]: FormGroup };
            if (b2bVisaType === 'TRANSIT') {
              residencyForm.reset();
              Object.keys(residencyForm.controls).forEach((key) => {
                const control = residencyForm.get(key);
                control.patchValue(null, { emitEvent: false });
                control.clearValidators();
                control.updateValueAndValidity();
                control.markAsUntouched();
              });
              Object.keys(applicationForm.controls).forEach((key) => {
                if (!(['fan_category', 'application_type'].includes(key))) {
                  const control = applicationForm.get(key);
                  control.patchValue(null, { emitEvent: false });
                  control.clearValidators();
                  control.updateValueAndValidity();
                }
              });
              Object.keys(contactForm.controls).forEach((key) => {
                const control = contactForm.get(key);
                // control.patchValue(null, { emitEvent: false });
                control.clearValidators();
                control.updateValueAndValidity();
              });
            } else if (b2bVisaType === 'CONFERENCE') {
              this.setInitialValidators();
              setContactFormInitialValidators(contactForm);
            } else {
              Object.keys(applicationForm.controls).forEach((key) => {
                if (!(['fan_category', 'application_type'].includes(key))) {
                  const control = applicationForm.get(key);
                  control.patchValue(null, { emitEvent: false });
                  control.clearValidators();
                  control.updateValueAndValidity();
                }
              });
            }
            const categoryObject = this.hayyaVisitCategories$.value.find(({ code: _code }) => _code === code);
            this.selectedHayyaVisitCategory$.next(categoryObject);
            this.setConferenceValidators(this.b2bVisaType === 'CONFERENCE');
            const t = TicketTypes.find(t => t.code === code);
            this.selectedFanCategory$.next(t);
            // this.setAccreditationValidator(categoryObject?.accreditationRequired);
          } catch (error) {
            console.error(error);
          }
        }
      });

    this.conference_name?.valueChanges
      .pipe(startWith(this.conference_name?.value),distinctUntilChanged(),takeUntil(this.unsubscribe$))
      .subscribe({
        next: async (conferenceId: number) => {
          if (this.isServiceCentre || !conferenceId) return;
          const conference = (await this.getConferenceEventList().toPromise())
            .find(({ confrenceId }) => confrenceId === conferenceId);
          const conferenceType = getConferenceType(conference);
          updateFormExtras(this.parentForm, { conferenceType });
          if (conferenceType === 'PUBLIC') {
            this.conferenceProfileListLoading$.next(true);
            this.conference_profile.setValidators([Validators.required]);
            this.user_category.clearValidators();
            this.conference_profile.updateValueAndValidity();
            this.user_category.updateValueAndValidity();
            const conferenceServiceRules = await this.getConferenceServiceRules(conference?.moi_ServiceId).toPromise();
            const { accreditationForm } = this.parentForm.controls as { [key: string]: FormGroup };
            accreditationForm.patchValue({ conference_service_rules: conferenceServiceRules });
            const conferenceProfileList = await this.getConferenceProfileList(conference?.code).toPromise();
            this.conferenceProfileList$.next(conferenceProfileList);
            console.log({ conferenceProfileList });
            this.conferenceProfileListLoading$.next(false);
            this.cd.detectChanges();
          }
          const conferenceUserCategoryCodes = conference?.categories?.split(',').map((code) => code?.trim()) || [];
          const organizationUserCategories: { id: number, code: string }[] = getFromLocalStorage({
            key: "organizationRegUserCategoryIdAndCode",
            parse: true
          }) ?? [];
          console.log({ conferenceUserCategoryCodes, organizationUserCategories });
          const filterFn = ({ code }) => {
            return conferenceUserCategoryCodes.includes(code) &&
              organizationUserCategories.map(({ code }) => code).includes(code);
          }
          const userCategories = (await this.metadata.getRegUserCategories({}).toPromise())
            .filter(filterFn);
          this.hayyaCategories$.next(userCategories);
        }
      });

    this.conference_profile?.valueChanges.pipe(
      startWith(this.conference_profile?.value),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: async (conference_profile: ConferenceEventProfileResponse | string | null) => {
        if (this.isServiceCentre) return;
        console.log({ conference_profile });
        if (typeof conference_profile === 'string') {
          const profileId = conference_profile;
          console.log({ profileIdString: profileId });
          if (this.conferenceProfileList$.value?.length) {
            const profile = this.conferenceProfileList$.value.find(({ profileId: _profileId }) => _profileId === profileId);
            this.conference_profile.setValue(profile);
            return;
          }
          const conferenceId = this.conference_name?.value;
          console.log({ conferenceId });
          const conference = (await this.getConferenceEventList().toPromise())
            .find(({ confrenceId }) => confrenceId === conferenceId);
          const conferenceType = getConferenceType(conference);
          if (conferenceType === 'PUBLIC') {
            const conferenceProfileList = await this.getConferenceProfileList(conference?.code).toPromise();
            const profile = conferenceProfileList?.find(({ profileId: _profileId }) => _profileId === profileId);
            this.conference_profile.setValue(profile);
          }
        }
      }
    });

    this.purpose_visit.valueChanges.pipe(startWith(this.purpose_visit.value), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (purpose_visit: string) => {
          this.setPurposeVisitOtherValidators(purpose_visit === 'OTE');
        }
      });
  }

  get af() {
    return this.formGroup.controls;
  }

  get user_category() {
    return this.af.user_category;
  }

  get fan_category() {
    return this.af.fan_category;
  }

  get application_type() {
    return this.af.application_type;
  }

  get conference_name() {
    return this.af.conference_name;
  }

  get purpose_visit_other() {
    return this.af.purpose_visit_other;
  }

  get purpose_visit() {
    return this.af.purpose_visit;
  }

  get conference_profile() {
    return this.af.conference_profile;
  }

  // get accreditation() {
  //   return this.af.accreditation;
  // }

  // get applicant_title() {
  //   return this.af.applicant_title;
  // }

  // get accreditation_category() {
  //   return this.af.accreditation_category;
  // }

  setInitialValidators() {
    if (this.isServiceCentre) return;
    this.user_category.setValidators([Validators.required]);
    this.user_category.updateValueAndValidity();
  }

  setConferenceNameValidator(required: boolean) {
    if (required) {
      this.conference_name.setValidators([Validators.required]);
    } else {
      this.conference_name.clearValidators();
    }
    this.conference_name.updateValueAndValidity();
  }

  setApplicantCategoryValidator(required: boolean) {
    if (required) {
      this.fan_category.setValidators([Validators.required]);
    } else {
      this.fan_category.clearValidators();
    }
    this.fan_category.updateValueAndValidity();
  }

  setConferenceValidators(required: boolean) {
    this.setConferenceNameValidator(required);
    this.setApplicantCategoryValidator(required);
  }

  setPurposeVisitValidators(purposeOfVisitExcluded = false) {
    if (!purposeOfVisitExcluded && this.b2bVisaType === 'VISA') {
      this.purpose_visit.setValidators([Validators.required]);
      this.purpose_visit.updateValueAndValidity();
    } else {
      this.purpose_visit.clearValidators();
      this.purpose_visit.updateValueAndValidity();
    }
  }

  setPurposeVisitOtherValidators(purposeVisitOther = false) {
    const purposeOfVisitExcluded = this.selectedFanCategory$.value?.purposeOfVisitExcluded;
    if (!purposeOfVisitExcluded && purposeVisitOther && this.b2bVisaType === 'VISA') {
      this.purpose_visit_other.setValidators([Validators.required]);
      this.purpose_visit_other.updateValueAndValidity();
    } else {
      this.purpose_visit_other.clearValidators();
      this.purpose_visit_other.updateValueAndValidity();
    }
  }

  getConferenceEventList() {
    return this.organizationService.getActiveConferenceEventList().pipe(
      catchError((error) => { return of({} as ActiveConferenceEventListResponse) }),
      map((response) => response?.data?.conferenceEventLists ?? [])
    )
  }

  getConferenceProfileList(code: string) {
    return this.organizationService.getConferencesByCode(code).pipe(
      catchError((error) => { return of({} as ConferencesByCodeResponse) }),
      map((response) => response?.data?.profileResponse ?? [])
    )
  }

  getConferenceServiceRules(id: string) {
    return this.organizationService.getConferenceFieldsAndRules(id).pipe(
      catchError((error) => { return of({} as ConferenceApplicationRulesListResponse) }),
      map((response) => response?.data?.responseData ?? [])
    )
  }

  onConferenceProfileChange(conferenceProfile: ConferenceEventProfileResponse) {
    const { accreditationForm } = this.parentForm.controls as { [key: string]: FormGroup };
    accreditationForm.reset();
  }
}
