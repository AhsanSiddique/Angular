import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroupInput } from '../../base-classes';
import { FormGroup, Validators } from '@angular/forms';
import { distinctUntilChanged, map, startWith, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  ConferenceApplicationRules,
  ConferenceEventBelonging,
  ConferenceEventCategory,
  ConferenceEventCategoryFunction,
  ConferenceEventOrganization,
  ConferenceEventProfileResponse,
  ConferenceEventVenue,
  ConferenceEventZone,
  MetadataResolve,
  ServiceFieldDisplayTypeDesc,
  ServiceFieldSelectionTypeDesc
} from '@fan-id/api/server';
import { AccreditationControlKey, MASK_PATTERNS, ServiceFieldNameControlKeyMap, updateFormExtras } from '@fan-id/shared/utils/form';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';

type AccreditationFieldConfig = {
  label: string,
  required: boolean,
  displayType: ServiceFieldDisplayTypeDesc,
  selectionType: ServiceFieldSelectionTypeDesc,
  placeholder: string,
  hasServiceRule: boolean
}

@Component({
  selector: 'fan-id-accreditation-form',
  templateUrl: './accreditation-form.component.html',
  styleUrls: ['./accreditation-form.component.scss']
})
export class AccreditationFormComponent extends FormGroupInput implements OnInit, OnDestroy {
  @Input() metadata$: Observable<MetadataResolve>;
  @Input() isExcel = false;
  private unsubscribe$ = new Subject<void>();
  arabicNamePattern = MASK_PATTERNS.ArabicWithSpaces;
  englishNamePattern = MASK_PATTERNS.EnglishWithSpaces;

  belongingList$ = new BehaviorSubject<ConferenceEventBelonging[]>([]);
  categoryList$ = new BehaviorSubject<ConferenceEventCategory[]>([]);
  categoryFunctionList$ = new BehaviorSubject<ConferenceEventCategoryFunction[]>([]);
  organizationList$ = new BehaviorSubject<ConferenceEventOrganization[]>([]);
  venueList$ = new BehaviorSubject<ConferenceEventVenue[]>([]);
  zoneList$ = new BehaviorSubject<ConferenceEventZone[]>([]);

  private _accreditationFieldsConfig: Partial<Record<AccreditationControlKey, AccreditationFieldConfig>> = {
    conference_categories: {
      label: 'Applicant Category',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Applicant Category',
      hasServiceRule: false
    },
    conference_functions: {
      label: 'Job Title',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Job Title',
      hasServiceRule: false
    },
    conference_function: {
      label: 'Job Title',
      required: false,
      displayType: 'Input',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Enter Job Title',
      hasServiceRule: false
    },
    conference_functionAr: {
      label: 'Job Title Arabic',
      required: false,
      displayType: 'Input',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Enter Job Title',
      hasServiceRule: false
    },
    conference_organizations: {
      label: 'Organization',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Organization',
      hasServiceRule: false
    },
    conference_organization: {
      label: 'Organization',
      required: false,
      displayType: 'Input',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Enter Organization',
      hasServiceRule: false
    },
    conference_organizationAr: {
      label: 'Organization Arabic',
      required: false,
      displayType: 'Input',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Enter Organization',
      hasServiceRule: false
    },
    conference_zones: {
      label: 'Zone',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Zone',
      hasServiceRule: false
    },
    conference_belongings: {
      label: 'Belonging',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Belonging',
      hasServiceRule: false
    },
    conference_venues: {
      label: 'Venue',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Venue',
      hasServiceRule: false
    },
    conference_representing_country: {
      label: 'Representing Country',
      required: false,
      displayType: 'List',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Select Representing Country',
      hasServiceRule: false
    },
    // in personal information form
    conference_personal_title: {
      label: 'Personal Title',
      required: false,
      displayType: 'Input',
      selectionType: ServiceFieldSelectionTypeDesc.SingleSelection,
      placeholder: 'Enter Personal Title',
      hasServiceRule: false
    }
  }
  accreditationFieldsConfig$ = new BehaviorSubject(this.accreditationFieldsConfig);

  constructor() {
    super();
  }

  ngOnInit() {
    this.conference_profile?.valueChanges.pipe(
      startWith(this.conference_profile?.value),
      distinctUntilChanged(),
      map((conference_profile: ConferenceEventProfileResponse | string | null) => {
        if (typeof conference_profile === 'string') {
          return null;
        }
        return conference_profile;
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (conference_profile: ConferenceEventProfileResponse | null) => {
        console.log({ conference_profile });
        // this.formGroup.reset();
        this.setConferenceEventLists(conference_profile);
        if (conference_profile) {
          if (conference_profile.visaOnly) {
            this.setConferenceProfileVisaOnlyRules();
          }
          if (this.acf.conference_categories?.value) this.setCategoryFunctionList(this.acf.conference_categories?.value);
        }
      }
    });

    this.service_rules?.valueChanges.pipe(
      startWith(this.service_rules?.value),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (conference_service_rules: ConferenceApplicationRules[] | null) => {
        if (this.conference_profile?.value?.visaOnly) return;
        this.updateAccreditationFieldsConfig(conference_service_rules);
        if (!conference_service_rules) return;
        this.correctAllFieldValuesBasedOnType();
      }
    });

    this.accreditationFieldsConfig$.pipe(distinctUntilChanged(), takeUntil(this.unsubscribe$))
      .subscribe({
        next: (accreditationFieldsConfig) => {
          console.count('accreditationFieldsConfig');
          for (const [key, value] of Object.entries(accreditationFieldsConfig)) {
            if (key === 'conference_personal_title') {
              updateFormExtras(this.parentForm, {
                accreditationPersonalTitleHasServiceRule: value.hasServiceRule,
                accreditationPersonalTitleRequired: value.required
              })
              continue;
            }

            if (value.required) {
              this.acf[key].setValidators([Validators.required]);
            } else {
              this.acf[key].clearValidators();
            }
            this.acf[key].updateValueAndValidity();
          }
        }
      });

    this.acf.conference_categories?.valueChanges.pipe(
      startWith(this.acf.conference_categories?.value),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (categoryCode: string | null) => {
        console.log({ categoryCode });
        this.af.user_category?.setValue(categoryCode);
      }
    })

    // this.acf.conference_functions?.valueChanges.pipe(
    //   startWith(this.acf.conference_functions?.value),
    //   distinctUntilChanged(),
    //   takeUntil(this.unsubscribe$)
    // ).subscribe({
    //   next: (functionCode: string | null) => {
    //     console.count('function');
    //     if (functionCode === 'OTHR') {
    //       this.acf.conference_function?.setValidators([Validators.required]);
    //     } else {
    //       this.acf.conference_function?.clearValidators();
    //     }
    //     this.acf.conference_function?.updateValueAndValidity();
    //   }
    // })

  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  get af() {
    return (this.parentForm?.get('applicationForm') as FormGroup)?.controls;
  }

  get pf() {
    return (this.parentForm?.get('personalInfoForm') as FormGroup)?.controls;
  }

  get acf() {
    return this.formGroup.controls;
  }

  get conference_profile() {
    return this.af?.conference_profile;
  }

  get service_rules() {
    return this.acf?.conference_service_rules;
  }

  get accreditationFieldsConfig() {
    return this._accreditationFieldsConfig;
  }

  set accreditationFieldsConfig(config) {
    this._accreditationFieldsConfig = config;
    this.accreditationFieldsConfig$.next(config);
  }

  get nationalitySearchFn() {
    return nationalitySearchFn;
  }

  setConferenceEventLists(conference_profile: ConferenceEventProfileResponse | null) {
    this.belongingList$.next(conference_profile?.belongings?.belonging ?? []);
    this.categoryList$.next(conference_profile?.categories?.category ?? []);
    this.organizationList$.next(conference_profile?.organizations?.organization ?? []);
    this.venueList$.next(conference_profile?.venues?.venue ?? []);
    this.zoneList$.next(conference_profile?.zones?.zone ?? []);
  }

  setCategoryFunctionList(categoryCode: string | null) {
    try {
      // const conference_profile = this.conference_profile?.value;
      // const categoryList = conference_profile?.categories?.category ?? [];
      const category = this.categoryList$?.value?.find((category) => category.code === categoryCode);
      console.log({ categoryCode, categoryList: this.categoryList$?.value, category });
      this.categoryFunctionList$.next(category?.functionsList?.function ?? []);
      // const functionsConfig = { ...this.accreditationFieldsConfig['conference_functions'] };
      // functionsConfig.required = category?.functionsList?.function?.length > 0;
      // this.setAccreditationFieldsConfig({ conference_functions: functionsConfig });
    } catch (error) {
      console.log(error);
    }
  }

  updateAccreditationFieldsConfig(conference_service_rules: ConferenceApplicationRules[] | null) {
    const newConfig = {};

    for (const rule of conference_service_rules ?? []) {
      console.log({rule});
      const {
        serviceFieldDisplayTypeDesc,
        serviceFieldSelectionTypeDesc,
        serviceFieldNameDesc,
        serviceFieldMandatoryDesc
      } = rule;
      const controlKey = ServiceFieldNameControlKeyMap[serviceFieldNameDesc];
      if (controlKey) {
        const controlConfig = { ...this.accreditationFieldsConfig[controlKey] };
        controlConfig.displayType = serviceFieldDisplayTypeDesc;
        controlConfig.selectionType = serviceFieldSelectionTypeDesc;
        controlConfig.required = serviceFieldMandatoryDesc === 'Mandatory';
        controlConfig.hasServiceRule = true;
        console.log({
          oldConfig: this.accreditationFieldsConfig[controlKey],
          newConfig: controlConfig
        })
        newConfig[controlKey] = controlConfig;
      }
    }

    this.setAccreditationFieldsConfig(newConfig);
  }

  setAccreditationFieldsConfig(partialConfig) {
    for (const key of Object.keys(this.accreditationFieldsConfig)) {
      partialConfig[key] = partialConfig[key] ? { ...partialConfig[key] } : { ...this.accreditationFieldsConfig[key] };
    }

    this.accreditationFieldsConfig = partialConfig;
  }

  setConferenceProfileVisaOnlyRules() {
    const newConfig = {};
    for (const key of Object.keys(this.accreditationFieldsConfig)) {
      if (key === 'conference_categories') {
        newConfig[key] = { ...this.accreditationFieldsConfig[key], required: true, hasServiceRule: true };
      } else {
        newConfig[key] = { ...this.accreditationFieldsConfig[key], required: false, hasServiceRule: false };
      }
    }

    this.accreditationFieldsConfig = newConfig;
  }

  onConferenceCategoryChange(category: ConferenceEventCategory) {
    this.acf.conference_functions?.reset();
    this.setCategoryFunctionList(category?.code);
  }

  correctAllFieldValuesBasedOnType() {
    for (const key of Object.keys(this.accreditationFieldsConfig)) {
      this.correctSelectionValueBasedOnType({ key, value: this.acf[key].value });
    }
  }

  correctSelectionValueBasedOnType({ key, value }) {
    const rule = this.accreditationFieldsConfig[key] as AccreditationFieldConfig;
    if (rule?.displayType === 'List' && rule?.selectionType === ServiceFieldSelectionTypeDesc.MultiSelection) {
      if (typeof value === 'string') {
        this.acf[key].setValue(value.split(','));
      }
    }
  }

}
