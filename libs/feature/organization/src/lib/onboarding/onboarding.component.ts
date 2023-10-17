import { catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActiveConferenceEvent, AuthService, MetaDataLookup, MetadataService, OrganizationConferenceEvent, OrganizationCustomerCategory, OrganizationService } from '@fan-id/api/server';
import { BehaviorSubject, Observable, Subject, of } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';
import { getB2BVisaType } from '@fan-id/shared/utils/form';
const EmailRegex = /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;

@Component({
  selector: 'fan-id-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent implements OnInit, OnDestroy {
  @Input() isEdit?= false;
  @Input() editData;
  @Output() closeThis = new EventEmitter();
  @Output() refreshPage = new EventEmitter();

  form!: FormGroup;
  showOrgEror = '';
  disableRadio = true;
  orgCategoryList: any;
  userCategoryList: any;
  userCategoryListAll!: any[];
  selectedCategoryList: any;
  orgCategorySelected: any;
  voucherCategoryEnabledList: any;
  voucherCategorySelected: any;
  conferenceEventList$!: Observable<ActiveConferenceEvent[]>;
  checkAllConferenceEventList = false;
  organizationConferenceEventList: OrganizationConferenceEvent[] = [];
  organizationCustomerCategoryList: OrganizationCustomerCategory[] = [];
  checkAllHayyaVisitCategory = false;
  hayyaVisitCategories$: Observable<MetaDataLookup[]>;
  private unsubscribe$ = new Subject<void>();
  // b2bVisaType: B2BVisaType | 'BOTH' = 'CONFERENCE';
  isConferenceSelected$ = new BehaviorSubject<boolean>(false);
  isTransitSelected$ = new BehaviorSubject<boolean>(false);
  isVisaSelected$ = new BehaviorSubject<boolean>(false);

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private orgService: OrganizationService,
    private metadataService: MetadataService
  ) {
    this.hayyaVisitCategories$ = this.metadataService.getMetaDataCustomerCategory({});
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      organizationName: ['', [Validators.required]],
      voucherRequired: ['', [Validators.required]],
      maxNoOfVouchers: ['', [Validators.required]],
      maxNoOfApplicants: ['', [Validators.required]],
      orgCategory: [[], [Validators.required]],
      requesterEmailId: ['', [Validators.required, Validators.pattern(EmailRegex)]],
      refVoucherCategory_Id: [null],
      hayyaVisitCategory: [[], [Validators.required]],
      conferenceEventList: [[]],
      userCategory: [[]],
    });
    this.setFormListeners();
  }

  getConferenceEventList() {
    return this.orgService.getActiveConferenceEventList().pipe(
      catchError((error) => {
        return of(null);
      }),
      map(response => response?.data?.conferenceEventLists ?? []),
    );
  }

  setFormListeners() {
    this.isConferenceSelected$.pipe(takeUntil(this.unsubscribe$)).subscribe({
      next: (selected) => {
        const conferenceEventList = this.form.get('conferenceEventList');
        const userCategory = this.form.get('userCategory');
        if (selected) {
          conferenceEventList?.setValidators([Validators.required]);
          userCategory?.setValidators([Validators.required]);
        } else {
          conferenceEventList?.clearValidators();
          conferenceEventList?.setValue([]);
          userCategory?.clearValidators();
          userCategory?.setValue([]);
        }
        conferenceEventList?.updateValueAndValidity();
        userCategory?.updateValueAndValidity();
      }
    })

    this.form.get('hayyaVisitCategory')?.valueChanges.pipe(
      startWith(this.form.get('hayyaVisitCategory')?.value),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (value: any[]) => {
        console.log({ value });
        const categoryCodes = value.map((a) => a.code as string);
        this.setHayyaVisitCategorySelectedProperties(categoryCodes);
        // const b2bVisaType = getB2BVisaType(value[0]?.code);
        // this.b2bVisaType = b2bVisaType;
        // if (value.length === 1) {
        //   if (b2bVisaType === 'TRANSIT') {
        //     this.form.get('conferenceEventList')?.clearValidators();
        //     this.form.get('conferenceEventList')?.setValue([]);
        //     this.form.get('conferenceEventList')?.updateValueAndValidity();
        //     const transitUserCategory = this.userCategoryListAll.find((a) => a.code === 'TRV');
        //     this.form.get('userCategory')?.setValue([transitUserCategory.id]);
        //   } else {
        //     this.form.get('conferenceEventList')?.setValidators([Validators.required]);
        //     this.form.get('conferenceEventList')?.updateValueAndValidity();
        //     if (this.editValueSet || !this.isEdit) this.form.get('userCategory')?.setValue([]);
        //   }
        // } else if (value.length === 2) {
        //   this.b2bVisaType = 'BOTH';
        //   this.form.get('conferenceEventList')?.setValidators([Validators.required]);
        //   this.form.get('conferenceEventList')?.updateValueAndValidity();
        //   if (this.editValueSet || !this.isEdit) this.form.get('userCategory')?.setValue([]);
        // }
      }
    });

    this.form.get('conferenceEventList')?.valueChanges.pipe(
      startWith(this.form.get('conferenceEventList')?.value),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: (value: ActiveConferenceEvent[]) => {
        try {
          if (value?.length > 0) {
            const categoryCodesWithConferenceName = value.map((a) => {
              const categoryCodes = a.categories?.split(',')?.map(c => c?.trim()) ?? [];
              return categoryCodes.map((b) => ({ code: b, conferenceName: a.name_EN }));
            }).reduce((a, b) => [...a, ...b], []);

            // console.log({categoryCodesWithConferenceName});
            // console.log({userCategoryListAll: this.userCategoryListAll, userCategoryList: this.userCategoryList});

            this.userCategoryList = categoryCodesWithConferenceName.map((a) => {
              const category = this.userCategoryListAll?.find((b) => b.code === a.code);
              // console.log({category});
              return category ? { ...category, categoryName: `${category.categoryName} (${a.conferenceName})` } : null;
            }).filter((a) => a !== null);

            // console.log({userCategoryList: this.userCategoryList});
            // if ((this.isEdit && this.editValueSet) || !this.isEdit) this.form.get('userCategory')?.setValue([]);
          } else {
            this.userCategoryList = [...(this.userCategoryListAll ?? [])];
            // if (this.editValueSet || !this.isEdit) this.form.get('userCategory')?.setValue([]);
          }
        } catch (error) {
          console.log({ error });
        }
      }
    });
  }

  setHayyaVisitCategorySelectedProperties(categoryCodes: string[]) {
    const isConferenceSelected = categoryCodes.some((a) => a === 'NCNF');
    this.isConferenceSelected$.next(isConferenceSelected);
    const isTransitSelected = categoryCodes.some((a) => a === 'TRV');
    this.isTransitSelected$.next(isTransitSelected);
    const isVisaSelected = categoryCodes.some((a) => getB2BVisaType(a) === 'VISA');
    this.isVisaSelected$.next(isVisaSelected);
    console.log({
      isConferenceSelected,
      isTransitSelected,
      isVisaSelected
    })
  }

  async setCategoryEventValues() {
    await this.setHayyaVisitCategory();
    await this.setConferenceEvent();
    this.setUserCategory();
  }

  setUserCategory() {
    const transitUserCategory = this.userCategoryListAll.find(({ code }) => code === 'TRV');
    // const generalPublicCategory = this.userCategoryListAll.find(({ code }) => code === 'GP');
    const allValues = this.selectedCategoryList
      .filter(a => ![transitUserCategory?.id].includes(a.refRegUserCategory_Id))
      .map(function (a) { return a.refRegUserCategory_Id; });
    this.form.controls.userCategory.setValue(allValues);
    this.form.patchValue({ orgCategory: this.orgCategorySelected });
  }

  async setConferenceEvent() {
    const conferenceEventList = await this.getConferenceEventList().toPromise();
    const conferenceEvents = this.organizationConferenceEventList.map(conference => {
      const conferenceEvent = conferenceEventList.find(event => event.confrenceId === conference.refConferenceEvent_Id);
      return { ...conferenceEvent };
    });
    this.form.controls.conferenceEventList.setValue([...conferenceEvents]);
  }

  async setHayyaVisitCategory() {
    const hayyaVisitCategoryList = await this.hayyaVisitCategories$.toPromise();
    const hayyaVisitCategory = this.organizationCustomerCategoryList.map(category => {
      const hayyaVisitCategory = hayyaVisitCategoryList.find(hayyaVisit => hayyaVisit.id === category.refCustomerCategory_Id);
      return { ...hayyaVisitCategory };
    })
    this.form.controls.hayyaVisitCategory.setValue([...hayyaVisitCategory]);
  }

  onChangeVoucher() {
    if (this.form.get('voucherRequired')?.value === 'yes') {
      this.disableRadio = false;
      this.form.controls.refVoucherCategory_Id?.setValidators([Validators.required]);
    } else {
      this.disableRadio = true;
      this.form.patchValue({ maxNoOfVouchers: 0 });
      this.form.controls.refVoucherCategory_Id?.patchValue(null);
      this.form.controls.refVoucherCategory_Id?.clearValidators();
    }
    this.form.controls.refVoucherCategory_Id?.updateValueAndValidity();
  }

  toggleCheckAll(event) {
    // console.log(event,this.form.get('userCategory').value);
    if (event === true) {
      this.selectAllItems();
    } else {
      this.unselectAllItems();
    }
  }
  private selectAllItems() {
    const allValues = this.userCategoryList.map(function (a) { return a.id; });
    console.log(allValues);
    this.form.controls.userCategory.setValue(allValues);

  }

  private unselectAllItems() {
    this.form.controls.userCategory.setValue(null);
  }

  inviteOrganization() {
    const maxVoucher = this.form.get('maxNoOfVouchers')?.value;
    if (this.isEdit) {
      const userCategories = this.form.get('userCategory')?.value ?? [];
      const organizationUserCategories = this.selectedCategoryList ?? [];
      const organizationRegUserCategories = organizationUserCategories.map(category => {
        return { ...category, isActive: userCategories.includes(category.refRegUserCategory_Id)};
      });
      userCategories.forEach((refRegUserCategory_Id) => {
        if (!organizationRegUserCategories.find(c => c.refRegUserCategory_Id === refRegUserCategory_Id)) {
          organizationRegUserCategories.push({ refRegUserCategory_Id });
        }
      });
      // console.table({ old: organizationUserCategories, new: organizationRegUserCategories });
      // let userCategory = this.selectedCategoryList.map(element => {
      //   element.isActive = organizationRegUserCategories.includes(element.refRegUserCategory_Id);
      //   return element;
      //   const index = organizationRegUserCategories.findIndex(d => d === element.refRegUserCategory_Id); //find index in your array
      //   organizationRegUserCategories.splice(index, 1);
      // });
      // userCategory = userCategory.concat(organizationRegUserCategories.map(function (a) { return { 'refRegUserCategory_Id': a } }));
      // console.log({ selected: this.selectedCategoryList, userCategory });
      const conferenceEventList = this.form.get('conferenceEventList')?.value as Array<ActiveConferenceEvent>;
      let organizationConferenceEvents = this.organizationConferenceEventList.map(conferenceEvent => {
        conferenceEvent.isActive = conferenceEventList.find(({ confrenceId }) => confrenceId === conferenceEvent.refConferenceEvent_Id) ? true : false;
        return conferenceEvent;
      });
      conferenceEventList.forEach(({ confrenceId }) => {
        if (!organizationConferenceEvents.some(conferenceEvent => conferenceEvent.refConferenceEvent_Id === confrenceId)) {
          organizationConferenceEvents.push({ refConferenceEvent_Id: confrenceId } as OrganizationConferenceEvent);
        }
      });

      const hayyaVisitCategories = this.form.get('hayyaVisitCategory')?.value as Array<MetaDataLookup>;
      const organizationCustomerCategoryLists = this.organizationCustomerCategoryList.map(customerCategory => {
        customerCategory.isActive = hayyaVisitCategories.find(({ id }) => id === customerCategory.refCustomerCategory_Id) ? true : false;
        return customerCategory;
      });
      hayyaVisitCategories.forEach(({ id }) => {
        if (!organizationCustomerCategoryLists.some(customerCategory => customerCategory.refCustomerCategory_Id === id)) {
          organizationCustomerCategoryLists.push({ refCustomerCategory_Id: id } as OrganizationCustomerCategory);
        }
      });

      organizationConferenceEvents = organizationConferenceEvents?.filter((conferenceEvent) => {
        return conferenceEvent?.refConferenceEvent_Id > 0;
      });

      const payload = {
        id: this.editData?.id,
        maximumVoucherCount: this.form.get('voucherRequired')?.value === 'yes' ? maxVoucher : 0,
        isVoucherGenerationEnabled: this.form.get('voucherRequired')?.value === 'yes' ? true : false,
        maximumApplicantCount: this.form.get('maxNoOfApplicants')?.value,
        organizationRegUserCategories,
        refOrganizationCategory_Id: this.form.get('orgCategory')?.value,
        refVoucherCategory_Id: this.form.get('voucherRequired')?.value === 'yes' ? this.form.get('refVoucherCategory_Id')?.value : 0,
        requesterEmailId: this.form.get('requesterEmailId')?.value,
        organizationConferenceEvents,
        organizationCustomerCategories: organizationCustomerCategoryLists
      };
      const transitUserCategory = this.userCategoryListAll.find(({ code }) => code === 'TRV');
      // const generalPublicCategory = this.userCategoryListAll.find(({ code }) => code === 'GP');
      const transitObjInResponse = this.selectedCategoryList.find((a) => a.refRegUserCategory_Id === transitUserCategory?.id);
      // const generalPublicObjInResponse = this.selectedCategoryList.find((a) => a.refRegUserCategory_Id === generalPublicCategory?.id);
      const isTransitSelected = this.isTransitSelected$.value;
      // const isVisaSelected = this.isVisaSelected$.value;
      if (isTransitSelected && !transitObjInResponse) {
        payload.organizationRegUserCategories.push({ refRegUserCategory_Id: transitUserCategory?.id });
      }
      if (transitObjInResponse) {
        transitObjInResponse.isActive = isTransitSelected;
      }
      // if (isVisaSelected && !generalPublicObjInResponse && generalPublicCategory) {
      //   payload.organizationRegUserCategories.push({ refRegUserCategory_Id: generalPublicCategory.id });
      // }
      // if (generalPublicObjInResponse) {
      //   generalPublicObjInResponse.isActive = isVisaSelected;
      // }
      this.authService.editOrganization(payload).subscribe(
        (response) => {
          if (response.status == '200') {
            this.refreshPage.emit();
          } else {
            this.showOrgEror = response.message;
          }
        },
        (error) => {
          this.showOrgEror = error?.error?.message;
        }
      )
    } else {
      const organizationRegUserCategories = this.form.get('userCategory')?.value;
      const userCategory = organizationRegUserCategories.map(function (a) { return { refRegUserCategory_Id: a } });
      let conferenceEventList = this.form.get('conferenceEventList')?.value?.map((a: ActiveConferenceEvent) => ({ refConferenceEvent_Id: a.confrenceId }));
      const organizationCustomerCategoryLists = this.form.get('hayyaVisitCategory')?.value?.map((a) => ({ refCustomerCategory_Id: a.id }));
      conferenceEventList = conferenceEventList?.filter((conferenceEvent: { refConferenceEvent_Id: number }) => {
        return conferenceEvent?.refConferenceEvent_Id > 0;
      });
      const payload = {
        OrganisationName: this.form.get('organizationName')?.value,
        PrimaryContactEmail: this.form.get('email')?.value,
        maximumVoucherCount: this.form.get('voucherRequired')?.value === 'yes' ? maxVoucher : 0,
        isVoucherGenerationEnabled: this.form.get('voucherRequired')?.value === 'yes' ? true : false,
        maximumApplicantCount: this.form.get('maxNoOfApplicants')?.value,
        organizationRegUserCategories: userCategory,
        refOrganizationCategory_Id: this.form.get('orgCategory')?.value,
        refVoucherCategory_Id: this.form.get('voucherRequired')?.value === 'yes' ? this.form.get('refVoucherCategory_Id')?.value : 0,
        requesterEmailId: this.form.get('requesterEmailId')?.value,
        organizationConferenceEventLists: conferenceEventList,
        organizationCustomerCategoryLists
      };
      const isTransitSelected = this.isTransitSelected$.value;
      // const isVisaSelected = this.isVisaSelected$.value;
      if (isTransitSelected) {
        const transitUserCategory = this.userCategoryListAll.find(({ code }) => code === 'TRV');
        payload.organizationRegUserCategories.push({ refRegUserCategory_Id: transitUserCategory?.id });
      }
      // if (isVisaSelected) {
      //   const generalPublicCategory = this.userCategoryListAll.find(({ code }) => code === 'GP');
      //   payload.organizationRegUserCategories.push({ refRegUserCategory_Id: generalPublicCategory?.id });
      // }
      // console.log({payload});
      // return
      this.authService.onboardOrganization(payload).subscribe(
        (response) => {
          if (response.status == '200') {
            this.refreshPage.emit();
          } else {
            this.showOrgEror = response.message;
          }
        },
        (error) => {
          this.showOrgEror = error?.error?.message;
        }
      );
    }
  }

  incrDecr(event, type: string) {
    let count = 0;
    if (type === "voucher") {
      count = this.form.get("maxNoOfVouchers")?.value;
    }
    else if (type === "application") {
      count = this.form.get("maxNoOfApplicants")?.value;
    }
    if (count === null) {
      if (event == "+") {
        count = 1;
      }
      else return
    } else if (event == "+") {
      count = +count + 1;
    } else if (event == "-" && +count > 0) {
      count = +count - 1;
    }
    if (type === "voucher") {
      this.form.controls.maxNoOfVouchers.patchValue(count);
    }
    else if (type === "application") {
      this.form.controls.maxNoOfApplicants.patchValue(count);
    }

  }

  onSelectAllChange(
    checked: boolean,
    formControlName: string,
    bindValue: string | null = null,
    ngSelectComponent: NgSelectComponent
  ) {
    const items = ngSelectComponent.itemsList.items;
    let values: any[] = [];
    if (checked) {
      values = bindValue ?
        items.map((x: any) => x?.value?.[bindValue]) :
        items.map((x: any) => x?.value);
    }
    this.form.get(formControlName)?.patchValue(values);
  }

  onMultiselectOptionChange(event) {
    console.log({ event });
    const value = this.form.get('conferenceEventList')?.value as ActiveConferenceEvent[];
    console.log({ value });
    if (value.length > 0) {
      const categoryCodesWithConferenceName = value.map((a) => {
        const categoryCodes = a.categories?.split(',') ?? [];
        return categoryCodes.map((b) => ({ code: b, conferenceName: a.name_EN }));
      }).reduce((a, b) => [...a, ...b], []);

      this.userCategoryList = categoryCodesWithConferenceName.map((a) => {
        const category = this.userCategoryListAll.find((b) => b.code === a.code);
        return category ? { ...category, categoryName: `${category.categoryName} (${a.conferenceName})` } : null;
      }).filter((a) => a !== null);

      console.log({ userCategoryList: this.userCategoryList });
    } else {
      this.userCategoryList = [...this.userCategoryListAll];
    }
  }

  onConferenceChange() {
    this.form.get('userCategory')?.setValue([]);
  }

}
