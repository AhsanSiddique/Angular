import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MetadataResolve, TournamentType, PackageUploadRegistrationData,
  PackageUploadService, BulkRegistrationService, IGetListByBulkGroupNameResponseObject, IPackageUploadExcelRegistrationRequest, MetaDataLookup, MetadataService, ActiveConferenceEvent, OrganizationService, ActiveConferenceEventListResponse, MetadataCustomerCategory
} from '@fan-id/api/server';
import { MenuService, ScrollService } from '@fan-id/core';
import { getFromLocalStorage } from '@fan-id/shared/utils/common';
import { ACCOMMODATION_DETAILS_VALIDATORS, B2BVisaType, EXCEL_USER_CATEGORIES_CODE_FOR_PACKAGE_UPLOAD, filterConferenceEventListByOrganization, filterHayyaVisitCategoryByOrganization, getB2BVisaType, getControlListValid$, getMetadataFilteredByUserCategory, INVALID_USER_CATEGORIES_CODE_FOR_NON_QID_PACKAGE_UPLOAD, INVALID_USER_CATEGORIES_CODE_FOR_QID, onUniqueFieldBlur, onUniqueFieldFocus } from '@fan-id/shared/utils/form';
import { BehaviorSubject, interval, Observable, of, Subject } from 'rxjs';
import { first, map, take, distinctUntilChanged, takeUntil, pairwise, catchError, startWith } from 'rxjs/operators';

enum EUploadType {
  NEW,
  ADD
}

const zip_file_types =
  ['application/zip', 'application/x-zip-compressed', 'application/x-zip', 'application/x-compressed', 'application/octet-stream'];
const excel_file_types =
  ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];

@Component({
  selector: 'fan-id-package-upload-step1',
  templateUrl: './package-upload-step1.component.html',
  styleUrls: ['./package-upload-step1.component.scss']
})
export class PackageUploadStep1Component implements OnInit, OnDestroy {
  packageUploadForm!: FormGroup;
  metadata$!: Observable<MetadataResolve>;
  _metadata$!: Observable<MetadataResolve>;
  file: File | null = null;
  show_cancel_modal = false;
  eventType = parseInt(localStorage.getItem('eventType') as string) as TournamentType;
  fileType: any = '';
  userOrganizationId = 0;
  RefSystemUser_Id!: number;
  register_success = false;
  register_error = false;
  register_error_message ='';
  is_file_uploaded = false;
  showHideField = false;
  youthProgramRegCheckBoolean = false;
  youthProgramErrorMsg = '';
  youthPgmSubmitErrorPopupBoolean = false;
  youthPgmSubmitSuccessPopupBoolean = false;
  onUniqueFieldFocus = onUniqueFieldFocus;
  upload_type: EUploadType = EUploadType.NEW;
  private readonly unsubscribe$ = new Subject<void>();
  hayyaVisitCategories$: Observable<MetaDataLookup[]>;
  conferenceEventList$: Observable<ActiveConferenceEvent[]>;
  b2bVisaType$: BehaviorSubject<B2BVisaType> = new BehaviorSubject<B2BVisaType>('TRANSIT');
  section1Valid$!: Observable<boolean>;
  section2Valid$!: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private menuService: MenuService,
    private packageUploadService: PackageUploadService,
    private bulkService: BulkRegistrationService,
    private scrollService: ScrollService,
    private metadataService: MetadataService,
    private organizationService: OrganizationService
  ) {

  }

  ngOnInit() {
    this._metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.resetMetadata();
    this.RefSystemUser_Id = parseInt(localStorage.getItem('userId') as string);
    this.userOrganizationId = parseInt(localStorage.getItem('organizationId') as string);
    this.setPackageUploadForm();
    this.scrollService.scrollToTop();
    this.initUploadType();
    this.setSectionValidations();
    this.setOrganizationValues();

    this.puf.hayyaVisitCategory.valueChanges.pipe(
      startWith(this.puf.hayyaVisitCategory.value),
      distinctUntilChanged(),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: (val) => {
        const b2bVisaType = getB2BVisaType(val);
        this.b2bVisaType$.next(b2bVisaType);
        const controlNames = ['conferenceId'] as const;
        if (b2bVisaType === 'TRANSIT' || b2bVisaType === 'VISA') {
          controlNames.forEach((controlName) => {
            this.puf[controlName].clearValidators();
            this.puf[controlName].setValue(null);
            this.puf[controlName].updateValueAndValidity();
            this.puf[controlName].markAsUntouched();
          });
        } else {
          controlNames.forEach((controlName) => {
            this.puf[controlName].setValidators(Validators.required);
            this.puf[controlName].updateValueAndValidity();
          });
        }
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initUploadType() {
    const upload_type = this.route.snapshot.queryParamMap.get(
      'type'
    );
    if (upload_type === 'add') {
      this.upload_type = EUploadType.ADD;
      const bulkgroup_data = history.state?.data;
      if (!bulkgroup_data) {
        this.router.navigate(['/main/bulk-groups/step-1']);
        return;
      }
      this.setPackageUploadFormData(bulkgroup_data);
      [
        this.puf.cgname,
        this.puf.user_category,
        this.puf.application_type,
        this.puf.hayya_number,
        this.puf.accodetails,
        this.puf.hayyaVisitCategory,
        this.puf.conferenceId,
      ].forEach((control) => {
        control?.disable();
      })
    }
  }

  setPackageUploadForm() {
    this.packageUploadForm = this.fb.group({
      application_type: ['Other', Validators.required],
      user_category: [null],
      cgname: [null, [
        Validators.required,
        Validators.maxLength(60),
        Validators.pattern('^[a-zA-Z0-9 ]*$')
      ]],
      uploadzipfile: [null, Validators.required],
      check: [false],
      confirm: [false],
      email_updates: [false],
      hayya_number: [''],
      accodetails: ['', ACCOMMODATION_DETAILS_VALIDATORS],
      hayyaVisitCategory: [null, Validators.required],
      conferenceId: [null],
    })

    // this.puf.application_type.valueChanges
    //   .pipe(
    //     distinctUntilChanged(),
    //     takeUntil(this.unsubscribe$)
    //   )
    //   .subscribe(val => {
    //     const user_category = this.puf.user_category.value;
    //     this.resetMetadata();
    //     if (val === 'QRC') {
    //       const isUserCategoryInvalidForQID = INVALID_USER_CATEGORIES_CODE_FOR_QID.includes(user_category);
    //       if (this.upload_type === EUploadType.NEW && isUserCategoryInvalidForQID) {
    //         this.puf.user_category.patchValue(null);
    //         this.puf.user_category.markAsUntouched();
    //       }
    //       this.metadata$ = getMetadataFilteredByUserCategory({
    //         metadata$: this.metadata$,
    //         userCategoryCodes: INVALID_USER_CATEGORIES_CODE_FOR_QID,
    //         filter_out: true
    //       });
    //     } else {
    //       const isUserCategoryInvalidForNonQID =
    //         INVALID_USER_CATEGORIES_CODE_FOR_NON_QID_PACKAGE_UPLOAD.includes(user_category);
    //       if (this.upload_type === EUploadType.NEW && isUserCategoryInvalidForNonQID) {
    //         this.puf.user_category.patchValue(null);
    //         this.puf.user_category.markAsUntouched();
    //       }
    //       this.metadata$ = getMetadataFilteredByUserCategory({
    //         metadata$: this.metadata$,
    //         userCategoryCodes: INVALID_USER_CATEGORIES_CODE_FOR_NON_QID_PACKAGE_UPLOAD,
    //         filter_out: true
    //       })
    //     }
    //   })

    this.puf.user_category.valueChanges
      .pipe(
        takeUntil(this.unsubscribe$),
        pairwise(),
      )
      .subscribe(([prev, curr]) => {
        // reset file when filetype changes
        if (EXCEL_USER_CATEGORIES_CODE_FOR_PACKAGE_UPLOAD.includes(prev) ||
          EXCEL_USER_CATEGORIES_CODE_FOR_PACKAGE_UPLOAD.includes(curr)
        ) {
          this.fileReset();
        }
      })
  }

  setSectionValidations() {
    const section1ControlNames = ['cgname', 'accodetails'].map((controlName) => this.puf[controlName]);
    this.section1Valid$ = getControlListValid$(section1ControlNames);
    const section2ControlNames = ['hayyaVisitCategory', 'conferenceId', 'uploadzipfile']
      .map((controlName) => this.puf[controlName]);
    this.section2Valid$ = getControlListValid$(section2ControlNames);
  }

  setOrganizationValues() {
    const organizationHayyaVisitCategories: { id: number, code: string }[] = getFromLocalStorage({
      key: "organizationCustomerCategoryIdAndCode",
      parse: true,
    });
    if (organizationHayyaVisitCategories.length === 1) {
      this.puf.hayyaVisitCategory.patchValue(organizationHayyaVisitCategories[0].code);
      this.puf.hayyaVisitCategory.disable();
    }
  }

  setPackageUploadFormData(data: IGetListByBulkGroupNameResponseObject) {
    const {
      bulkGroupName: cgname,
      orgGroupAccommodationAddress: accodetails,
      refRegUserCategory_Code: user_category,
      refApplicationType_Code: application_type,
      refParentFanIdNo: hayya_number,
      refConferenceEvent_Id: conferenceId,
      refCustomerCategory_Code: hayyaVisitCategory,
    } = data;
    this.showHideField = this.youthProgramRegCheckBoolean = !!hayya_number;
    this.packageUploadForm.patchValue({
      cgname,
      accodetails,
      user_category,
      application_type,
      hayya_number,
      conferenceId,
      hayyaVisitCategory,
    })
  }

  resetMetadata() {
    this.metadata$ = getMetadataFilteredByUserCategory({ metadata$: this._metadata$, filterDefaults: null });
  }

  get puf() {
    return this.packageUploadForm.controls;
  }

  isPackageExcel() {
    const user_category = this.puf.user_category.value;
    const application_type = this.puf.application_type.value;
    return user_category === 'SFP' || (user_category === 'LSC' && application_type === 'QRC');
  }

  onBulkGroupNameBlur() {
    const control = this.packageUploadForm.get('cgname');
    const value = control?.value;
    if (control?.valid) {
      const body = {
        refOrganization_Id: this.userOrganizationId,
        bulkGroupName: value,
        refTournament_Code: localStorage.getItem('eventCode')
      }
      const service$ = this.bulkService.validateBulkGroupName(body);
      onUniqueFieldBlur(control, service$);
    }
  }

  onUploadFileClick() {
    interval(1000).pipe(take(1)).subscribe({
      next: () => { this.is_file_uploaded = true; }
    })
  }

  uploadfile(args: any) {
    this.file = null;
    this.is_file_uploaded = true;
    const accepted_file_types = this.isPackageExcel() ? excel_file_types : zip_file_types;
    if (args.target.files && args.target.files.length) {
      this.file = <File>args.target.files[0];
      if (accepted_file_types.includes(this.file.type)) {
        this.puf.uploadzipfile.setValue(this.file);
        this.fileType = null;
      } else {
        this.puf.uploadzipfile.reset();
        this.fileType = this.file.name;
        this.file = null;
      }
    }
  }

  fileReset(event?) {
    event?.stopPropagation();
    event?.preventDefault();
    this.puf.uploadzipfile.reset(null);
    this.file = null;
  }

  formSubmit() {
    if (this.isPackageExcel()) {
      this.excelUploadFormSubmit();
    } else {
      this.packageUploadFormSubmit();
    }
  }

  packageUploadFormSubmit() {
    if (this.packageUploadForm.invalid) return;
    const {
      cgname: BulkGroupName,
      accodetails: OrgGroupAccommodationAddress,
      // user_category: RefRegUserCategory_Code,
      application_type: RefApplicationType_Code,
      hayya_number: RefParentFanIdNo,
      email_updates: OptInMarketing,
      hayyaVisitCategory: RefCustomerCategory_Code,
      conferenceId: RefConferenceEvent_Id
    } = this.packageUploadForm.getRawValue();
    const payload: PackageUploadRegistrationData = {
      RefEvent_Code: this.menuService.getSelectedEventCode() as string,
      // RefRegUserCategory_Code,
      RefApplicationType_Code,
      BulkGroupName,
      RefOrganization_Id: this.userOrganizationId,
      RefSystemUser_Id: this.RefSystemUser_Id,
      file: this.file as File,
      IsTermsAndConditions: true,
      OptInMarketing,
      RefParentFanIdNo,
      OrgGroupAccommodationAddress,
      RefCustomerCategory_Code,
      ...(this.b2bVisaType$.value === 'CONFERENCE' && { RefConferenceEvent_Id } ),
      ...(this.b2bVisaType$.value === 'TRANSIT' && { RefRegUserCategory_Code: 'TRV' }),
      ...(this.b2bVisaType$.value === 'VISA' && { RefRegUserCategory_Code: 'GP' }),
    }

    if (this.upload_type === EUploadType.ADD) {
      this.packageUploadService.UploadPackageToBulkGroup(payload).subscribe(
        {
          next: (response) => {
            if (response.totatlSuccess === 0) {
              this.register_error = true;
              this.register_error_message = 'We were unable to import your package. Please check the guidelines from the Knowledge Base section and try re-uploading the package.'
            } else {
              this.register_success = true;
            }
          },
          error: (error) => {
            this.register_error = true;
            console.log(error);
            this.register_error_message = error?.error?.message || "Something went wrong!";
          }
        }
      )
      return;
    }

    this.packageUploadService
      .PackageUploadRegistration(payload, this.showHideField)
      .pipe(first())
      .subscribe(
        (response) => {
          if (response.totatlSuccess === 0) {
            this.register_error = true;
            this.register_error_message = 'We were unable to import your package. Please check the guidelines from the Knowledge Base section and try re-uploading the package.'
          } else {
            this.register_success = true;
          }
          this.youthProgramRegCheckBoolean = false;
        },
        (error) => {
          this.register_error = true;
          this.youthProgramRegCheckBoolean = false;
          console.log(error);
          this.register_error_message = error?.error?.message || "Something went wrong!";
        }
      );
  }

  excelUploadFormSubmit() {
    if (this.packageUploadForm.invalid) return;
    const {
      cgname: BulkGroupName,
      accodetails: OrgGroupAccommodationAddress,
      user_category: RefRegUserCategory_Code
    } = this.packageUploadForm.getRawValue();
    const body: IPackageUploadExcelRegistrationRequest = {
      RefEvent_Code: this.menuService.getSelectedEventCode() as string,
      BulkGroupName,
      RefOrganization_Id: this.userOrganizationId,
      RefSystemUser_Id: this.RefSystemUser_Id,
      Channel: 8,
      file: this.file as File,
      OrgGroupAccommodationAddress,
      RefRegUserCategory_Code
    }

    if (this.upload_type === EUploadType.ADD) {
      this.packageUploadService
      .packageUploadExcelRegistrationExisting(body)
      .subscribe({
        next: response => {
          if (response.totatlSuccess === 0) {
            this.register_error = true;
            this.register_error_message = 'We were unable to import your excel. Please check the guidelines from the Knowledge Base section and try re-uploading the excel.'
          } else {
            this.register_success = true;
          }
        },
        error: error => {
          this.register_error = true;
          console.log(error);
          this.register_error_message = error?.error?.message || "Something went wrong!";
        }
      })
      return;
    }

    this.packageUploadService
      .packageUploadExcelRegistration(body)
      .subscribe({
        next: response => {
          if (response.totatlSuccess === 0) {
            this.register_error = true;
            this.register_error_message = 'We were unable to import your excel. Please check the guidelines from the Knowledge Base section and try re-uploading the excel.'
          } else {
            this.register_success = true;
          }
        },
        error: error => {
          this.register_error = true;
          console.log(error);
          this.register_error_message = error?.error?.message || "Something went wrong!";
        }
      })
  }

  closeRegisterSuccess() {
    this.register_success = false;
    this.router.navigate(['/main/bulk-groups/step-1']);
  }

  closeRegisterError() {
    this.register_error = false;
  }

  categoryChange() {
    this.youthProgramRegCheckBoolean = false;
    if(this.puf.user_category.value === 'YTH') {
      this.puf.hayya_number.setValidators([Validators.required]);
      this.showHideField = true;
    } else {
      this.showHideField = false;
      this.puf.hayya_number.clearValidators();
    }
    this.puf.hayya_number.patchValue('');
  }

  onHayyaNumberChange() {
    if(this.youthProgramRegCheckBoolean) {
      this.youthProgramRegCheckBoolean = false;
    }
  }

  youthProgramRegCheck() {
    this.youthProgramRegCheckBoolean = false;
    const body = {
      parentFanIdNo: this.packageUploadForm.get('hayya_number')?.value,
      eventCode: localStorage.getItem('eventCode')
    }
    this.packageUploadService.checkFanid(body).subscribe(response => {
      if (response.status === 200) {
        this.youthProgramRegCheckBoolean = true;
        this.youthPgmSubmitErrorPopupBoolean = false;
        this.youthPgmSubmitSuccessPopupBoolean = true;
      }
      else {
        this.youthProgramRegCheckBoolean = false;
        this.youthPgmSubmitErrorPopupBoolean = true;
        this.youthPgmSubmitSuccessPopupBoolean = false;
        // this.youthProgramErrorMsg ='Sorry, We were not able to find an application with the provided Hayya Card Number. Please try again.'
        this.youthProgramErrorMsg = response.message;
      }
    },
      err => {
        this.youthProgramRegCheckBoolean = false;
        this.youthPgmSubmitErrorPopupBoolean = true;
        this.youthPgmSubmitSuccessPopupBoolean = false;
        let error_mesage = "Something went wrong, please try again.";
        switch (err?.error?.resultCode) {
          case 58:
            error_mesage = "Sorry, We were not able to find an application with the provided Hayya Card Number. Please try again."
            break;
          case 399:
            error_mesage = "Sorry, the provided Hayya Card Number is of a Dependent Application. Please try again with the Hayya Card Number of a Primary Applicant."
            break;
          default:
            break;
        }
        this.youthProgramErrorMsg = error_mesage;
      })
  }

  disableSubmit() {
    let result = false;
    if (this.packageUploadForm.invalid) {
      result = true;
    }
    if (this.showHideField === true && this.youthProgramRegCheckBoolean === false) {
      result = true;
    }
    return result;
  }

  youthButtonDisable() {
    let result = false
    if (this.packageUploadForm.get('hayya_number')?.value === '') {
      result = true;
    }
    return result;
  }

  cancel() {
    this.router.navigate(["/main/bulk-registration"]);
  }
}
