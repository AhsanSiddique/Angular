import { Component, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  MetadataResolve,
  ApplicantDetailResolved,
  CustomerCardApplicationInsertRequest,
  OcrScanQidResultDto,
  MoiEhterazValidationRequest,
  IRegulaPassportOCR,
  IValidateEmailPhoneDocumentRequest,
  TICAODocumentInformation,
  ESubmissionType,
  CustomerCardApplicationGetListResponse,
} from "@fan-id/api/server";
import { AccreditationForm, UploadDocumentFormComponent } from "@fan-id/shared/shared-forms";
import { Environment, FanIDConfig, RegistrationFormService } from "@fan-id/core";
import { Observable, Subject } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
import { convertNgbDateToISO, convertDateStringToNgbDate, convertDateDDMMYYYYToMMDDYYYY, fromJSDate, DIPLOMAT_QID_EXPIRY_DATE, checkPassportDateOfBirthBelowYear } from "@fan-id/shared/utils/date";
import { EPassportCategory, ETicketField, FORM_PLACEHOLDERS, getICAOTableData, getMetadataFilteredByUserCategory, getPassportOCRCategory, isCountryGCC, ITicketType, MIN_FACE_MATCH_SCORE, onUniqueFieldBlur, patchOCRfield, resetPatchedOCRfield, TicketTypes, TICKET_FORM_DISABLED_CHANNELS, updateFormExtras, TApplicationType, getApplicationType, CATEGORIES_WITH_GCC_PERMIT_SC, getFormExtras, getB2BVisaType, RestrictedNationalitiesForHWM } from '@fan-id/shared/utils/form';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import * as getCountryISO2 from 'country-iso-3-to-2';
import { MediaKeys } from "./mediaKeys";

@Component({
  selector: 'fan-id-edit-application-detail',
  templateUrl: './edit-application-detail.component.html',
  styleUrls: ['./edit-application-detail.component.scss'],
})
export class EditApplicationDetailComponent extends AccreditationForm implements OnInit, OnDestroy {
  translateKey = 'EditApplication';
  isServiceCenter = false;
  show_cancel_modal = false;

  applicantForm: FormGroup;
  ticketForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  residencyForm: FormGroup;
  accommodationForm: FormGroup;
  personalInfoForm: FormGroup;
  contactForm: FormGroup;
  cardChoiceForm: FormGroup;
  termsForm: FormGroup;

  @ViewChild(UploadDocumentFormComponent, { static: true })
  private uploadFormComponent!: UploadDocumentFormComponent;

  metadata$: Observable<MetadataResolve>;
  _metadata$: Observable<MetadataResolve>;

  confirm_submit_open = false;
  fanId: string;
  applicationNo: string;
  submitReasonType: string;

  applicant_error: string;
  register_error: string;

  FaceIDScore: number;
  BioMatchId: string;
  DocQualityScore: string;
  IschildApplication: boolean;
  RefParentfanIdNo: string;
  RefSystemUser_Id: number;
  bulkGroupExtractId: string | null;

  ocr_error: string;
  submissionType: number;
  registrationServiceCenterCode: string;
  from: {bulkGroupName: string, organizationId: string, organizationName: string};

  resubmit_success = false;
  image_loading = false;
  moi_error: boolean;

  show_update_info_alert = false;
  show_resubmit_alert = false;
  ocr_fields_patched: AbstractControl[] = [];

  qid_validated = true;
  passport_validated = true;
  face_validated = true;

  OrgGroupAccommodationAddress: string;
  bulkGroupName: string;
  isProfilePicICAOComplains: boolean;
  icaoAndOcrError: string;

  qid_exists_error: boolean;
  icao_data!: TICAODocumentInformation;
  B2bApplicationInSC = false;
  cardDeliveryTypeCode = 'DHC';
  applicantData: CustomerCardApplicationGetListResponse;
  canUserApplyValid = false;
  applicationType: TApplicationType = 'VISA';
  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private registrationFormService: RegistrationFormService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  ngOnInit() {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.fanId = this.route.snapshot.queryParamMap.get('fanid');
    this.submitReasonType = this.route.snapshot.queryParamMap.get('submitReasonType');
    this.from = {
      bulkGroupName: this.route.snapshot.queryParamMap.get('from'),
      organizationId: this.route.snapshot.queryParamMap.get('organizationId'),
      organizationName: this.route.snapshot.queryParamMap.get('organizationName'),
    }
    if(!this.submitReasonType) {
      this.redirectToList();
    }
    this.show_update_info_alert = +this.submitReasonType === 3;
    this.show_resubmit_alert = +this.submitReasonType === 2;
    if (!this.isServiceCenter) {
      this._metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
      this.metadata$ = getMetadataFilteredByUserCategory({ metadata$: this._metadata$ });
    } else {
      this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    }
    this.initializeForms();
    this.isServiceCenter && this.setVIPValidations();
    !this.isServiceCenter && this.initializeAccreditationForm(this.applicantForm);
    this.registrationFormService.scroll.scrollToTop();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeForms() {
    this.applicantForm = this.fb.group({
      ...(this.getTicketForm()),

      applicationForm: this.fb.group({
        application_type: [null, Validators.required],
        gcc_country: [''],
        fan_category: [null, this.isServiceCenter ? [] : [Validators.required]],
        current_country: [null],
        // nationality: [null],
        estimated_arrival: [null],
        user_category: [null, this.isServiceCenter ? [] : [Validators.required]],
        conference_name: [null],
        ...(!this.isServiceCenter && {
          purpose_visit: [null],
          purpose_visit_other: [''],
          conference_profile: [null],
        })
      }),

      uploadDocumentForm: this.fb.group({
        user_image: [''],
        user_image_url: [''],
        user_image_src: [''],
        document_type: ['', Validators.required],
        document_front: [''],
        document_front_src: [''],
        document_proof: [''],
        document_proof_src: [''],
        PrintedQID:[''],
        document_number: ['', Validators.required],
        document_expiry: [null, Validators.required],
        dateofbirth: ['', Validators.required],
        issuing_country: [null, Validators.required],
        passportCategory:[!this.isServiceCenter?'NORMAL':null,Validators.required],
        nationality: [null, Validators.required],
      }),

      ...(this.getResidencyForm()),
      ...(this.getAccommodationForm()),

      personalInfoForm: this.fb.group({
        ticket_reference_number: [''],
        order_id: [''],
        voucher_code: [''],
        title: [null],
        titleEN: [''],
        titleAR: [''],
        firstname: ['', Validators.required],
        secondname: [''],
        thirdname: [''],
        fourthname: [''],
        lastname: ['', Validators.required],
        firstname_ar: [''],
        secondname_ar: [''],
        thirdname_ar: [''],
        fourthname_ar: [''],
        lastname_ar: [''],
        gender: [null, Validators.required],
        phonecode: [FORM_PLACEHOLDERS.phonecode, Validators.required],
        mobile: ['', [
          Validators.required,
          Validators.maxLength(15)
        ]],
        email: ['', [Validators.required, Validators.email]],
        medical:[[]],
        contactname: ['', [Validators.required, Validators.maxLength(24)]],
        contactnumber: ['', [Validators.required, Validators.maxLength(20)]],
        contactcode: [null, Validators.required],
      }),

      ...(this.getContactForm()),

      cardChoiceForm: this.fb.group({
        receive_card: [false],
      }),

      ...(this.getTermsForm()),

      extras: [{manualUpload: !this.isServiceCenter}],
    });

    this.ticketForm = this.applicantForm.get('ticketForm') as FormGroup;
    this.applicationForm = this.applicantForm.get('applicationForm') as FormGroup;
    this.uploadDocumentForm = this.applicantForm.get('uploadDocumentForm') as FormGroup;
    this.residencyForm = this.applicantForm.get('residencyForm') as FormGroup;
    this.accommodationForm = this.applicantForm.get('accommodationForm') as FormGroup;
    this.personalInfoForm = this.applicantForm.get('personalInfoForm') as FormGroup;
    this.contactForm = this.applicantForm.get('contactForm') as FormGroup;
    // this.emergencyContactForm = this.applicantForm.get(
    //   'emergencyContactForm'
    // ) as FormGroup;
    // this.preferredCollectionForm = this.applicantForm.get(
    //   'preferredCollectionPointForm'
    // ) as FormGroup;
    this.cardChoiceForm = this.applicantForm.get('cardChoiceForm') as FormGroup;
    this.termsForm = this.applicantForm.get('termsForm') as FormGroup;
  }

  getTicketForm() {
    if(!this.isServiceCenter) return null;
    return {
      ticketForm: this.fb.group({
        ticket_type: [null, Validators.required],
        ticket_number: ['', Validators.required],
        ticket_valid: [false, Validators.requiredTrue],
        purpose_visit: [null, Validators.required],
        purpose_visit_other: [''],
      })
    }
  }

  getResidencyForm() {
    return {
      residencyForm: this.fb.group({
        country_birth: [null],
        country_residence: [null],
        previous_nationality: [null],
        permit_document: [null],
        visa_copy_document: [null],
        job_title: [null],
        job_title_other: [''],
        has_previous_nationality: [''],
      }),
    }
  }

  getAccommodationForm() {
    if(!this.isServiceCenter) return null;
    return {
      accommodationForm: this.fb.group({
        accommodation_type: [null],
        accommodation_name: [''],
      }),
    }
  }

  getContactForm() {
    if(this.isServiceCenter) return null;
    return {
      contactForm: this.fb.group({
        phonecode: [FORM_PLACEHOLDERS.phonecode],
        mobile: [''],
        emergencyPhoneCode: [null],
        emergencyPhoneNumber: [''],
      }),
    }
  }

  getTermsForm() {
    const sc = this.isServiceCenter;
    return {
      termsForm: this.fb.group({
        check: sc ? [false, [Validators.requiredTrue]] : [false],
        confirm: sc ? [false, [Validators.requiredTrue]] : [false],
        email_updates: [false]
      }),
    }
  }

  setVIPValidations() {
    this.fan_category.valueChanges.pipe(takeUntil(this.unsubscribe$))
    .subscribe((val: string | null) => {
      if(val === 'VIP') {
        this.uf.document_front?.clearValidators();
        this.uf.document_front_src?.clearValidators();
        this.uf.document_proof?.clearValidators();
        this.uf.document_proof_src?.clearValidators();
        this.uf.document_expiry.clearValidators();
        this.uf.issuing_country.clearValidators();
        this.uf.passportCategory?.clearValidators();

        this.uf.document_front?.updateValueAndValidity();
        this.uf.document_front_src?.updateValueAndValidity();
        this.uf.document_proof?.updateValueAndValidity();
        this.uf.document_proof_src?.updateValueAndValidity();
        this.uf.document_expiry.updateValueAndValidity();
        this.uf.issuing_country.updateValueAndValidity();
        this.uf.passportCategory?.updateValueAndValidity();
      } else {
        this.uf.document_front?.setValidators([Validators.required]);
        this.uf.document_front_src?.setValidators([Validators.required]);
        this.uf.document_front?.updateValueAndValidity();
        this.uf.document_front_src?.updateValueAndValidity();
        // to retrigger the validator listerners
        this.application_type?.patchValue(this.application_type?.value);
        this.nationality?.patchValue(this.nationality?.value);
        this.document_type?.patchValue(this.document_type?.value);
      }
    })
  }

  get b2bVisaType() {
    return getFormExtras(this.applicantForm)?.b2bVisaType;
  }

  get conferenceType() {
    if (this.b2bVisaType !== 'CONFERENCE') return null;
    return getFormExtras(this.applicantForm)?.conferenceType;
  }

  get confirmSubmitType() {
    if (!this.isServiceCenter) return 'submit';
    const isHWM = ['HWM', 'NHWM'].includes(this.fan_category?.value);
    const isNationalityRestrictedForHWM = RestrictedNationalitiesForHWM.includes(this.nationality?.value);
    if (isHWM && isNationalityRestrictedForHWM) return 'hwm-submit';
    return 'submit';
  }

  //#region form value set methods
  setTicketFormValue(
    { ticketFieldValue, customerCategoryCode, refPurposeOfVisit_Code, purposeOfVisit }: {
      ticketFieldValue: { [key in ETicketField]: any },
      customerCategoryCode: string,
      refPurposeOfVisit_Code: string,
      purposeOfVisit: string
    }) {
    const ticket_type = TicketTypes.find(t => t.code === customerCategoryCode);

    if (this.applicationType === 'FWC') {
      this.ticketForm?.patchValue({
        ticket_type,
        ticket_number: ticket_type?.ticketField ? ticketFieldValue[ticket_type.ticketField] : null,
        ticket_valid: true,
        purpose_visit: refPurposeOfVisit_Code,
        purpose_visit_other: purposeOfVisit
      })
      this.ticketForm?.disable();
    } else {
      this.ticketForm?.patchValue({
        ticket_type,
        ticket_number: ticket_type?.ticketField ? ticketFieldValue[ticket_type.ticketField] : null,
        ticket_valid: true,
        purpose_visit: refPurposeOfVisit_Code,
        purpose_visit_other: purposeOfVisit
      })
      // const enabledApplicationStatusList = [ApplicationStatus.Rejected, ApplicationStatus.DataError];
      // const disableTicketForm = !enabledApplicationStatusList.includes(this.applicantData.applicationStatus);
      // if (disableTicketForm) this.ticketForm?.disable();
      this.ticketForm?.disable();
    }
  }

  setApplicationFormValue(data: any) {
    const {
      application_type,
      // gcc_country,
      fan_category,
      // current_country,
      // nationality,
      // estimated_arrival,
      user_category,
      conference_name,
      purpose_visit,
      purpose_visit_other,
      conference_profile
    } = data;
    this.applicationForm.patchValue({
      application_type,
      // gcc_country,
      fan_category,
      // current_country,
      // nationality,
      // estimated_arrival,
      user_category,
      conference_name,
      ...(!this.isServiceCenter && { purpose_visit, purpose_visit_other, conference_profile }),
    });
  }

  async setUploadDocumentFormValue(data: any) {
    const {
      document_type,
      profilePic,
      docImageFront,
      document_number,
      dateofbirth,
      document_expiry,
      issuing_country,
      passportCategory,
      // PrintedQID
      nationality
    } = data;
    this.uploadDocumentForm.patchValue({
      // user_image_url,
      document_type,
      document_number,
      dateofbirth,
      document_expiry,
      issuing_country,
      passportCategory,
      nationality
      // ...(document_type === 1 && { PrintedQID })
    });
    if(!this.isServiceCenter && passportCategory === EPassportCategory.TRAVELDOCUMENT) this.uf.passportCategory.disable();
    this.registrationFormService.spinner.show('upload-info-image')
    const userImageUrl = this.registrationFormService.applicant.composeImageUrl(
      profilePic,
      false,
    );
    if (userImageUrl) {
      const imageBlob = await this.registrationFormService.applicant
        .getImageBlob(userImageUrl)
        .pipe(take(1))
        .toPromise()
        .catch(err => {
          console.log('userImageBlob', err);
          return null;
        })

      if (imageBlob) {
        this.uf.user_image.patchValue(imageBlob);
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        reader.onload = () => {
          this.uploadFormComponent.user_image_src = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string
        );
          this.uf.user_image_src.patchValue(reader.result);
        };
      }
    }

    const docImageUrl = this.registrationFormService.applicant.composeImageUrl(
      docImageFront,
      false,
    );
    if (docImageUrl) {
      const imageBlob = await this.registrationFormService.applicant
        .getImageBlob(docImageUrl)
        .pipe(take(1))
        .toPromise()
        .catch(err => {
          console.log('docImageBlob', err);
          return null;
        })

      if (imageBlob) {
        this.uf.document_front.patchValue(imageBlob);
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        reader.onload = () => {
          this.uf.document_front_src.patchValue(reader.result as string);
        };
      }
    }
    this.registrationFormService.spinner.hide('upload-info-image')
  }

  async setResidencyFormValue(data: any) {
    const {
      country_birth, country_residence, previous_nationality,
      visa_copy_document, permit_document, job_title, job_title_other,
    } = data;
    let ticket_type: ITicketType;
    if (this.isServiceCenter) {
      ticket_type = this.ticketForm?.get('ticket_type')?.value;
    } else {
      const fan_category = this.applicationForm.getRawValue().fan_category;
      ticket_type = TicketTypes.find(t => t.code === fan_category);
    }

    this.registrationFormService.spinner.show('upload-info-image');

    const permitDocumentUrl = this.registrationFormService.applicant.composeImageUrl(
      permit_document,
      false,
    );
    let permitDocument: File | null = null;
    if (permitDocumentUrl && isCountryGCC(country_residence) && CATEGORIES_WITH_GCC_PERMIT_SC.includes(ticket_type?.code as any)) {
      const imageBlob = await this.registrationFormService.applicant
        .getImageBlob(permitDocumentUrl)
        .pipe(take(1))
        .toPromise()
        .catch(err => {
          console.log('permitDocument', err);
          return null;
        })

      if (imageBlob) {
        permitDocument = new File([imageBlob], 'permit_document.jpg', { type: 'image/jpeg' });
      }
    }

    const visaCopyDocumentUrl = this.registrationFormService.applicant.composeImageUrl(
      visa_copy_document,
      false,
    );
    let visaCopyDocument: File | null = null;
    if (visaCopyDocumentUrl && ticket_type?.visaCopyRequired) {
      const imageBlob = await this.registrationFormService.applicant
        .getImageBlob(visaCopyDocumentUrl)
        .pipe(take(1))
        .toPromise()
        .catch(err => {
          console.log('visaCopyDocument', err);
          return null;
        })

      if (imageBlob) {
        visaCopyDocument = new File([imageBlob], 'visa_copy_document.jpg', { type: 'image/jpeg' });
      }
    }

    this.registrationFormService.spinner.hide('upload-info-image');

    this.residencyForm?.patchValue({
      country_birth,
      country_residence,
      has_previous_nationality: previous_nationality ? 'YES' : 'NO',
      previous_nationality,
      job_title,
      job_title_other,
      ...(permitDocument && { permit_document: permitDocument }),
      ...(visaCopyDocument && { visa_copy_document: visaCopyDocument }),
    });
  }

  setAccommodationFormValue(data: any) {
    const { accommodation_type, accommodation_name } = data;
    this.accommodationForm?.patchValue({
      accommodation_type,
      accommodation_name,
    })
  }

  setPersonalInfoFormValue(data: any) {
    const {
      // ticket_reference_number,
      // order_id,
      // voucher_code,
      title,
      titleAR,
      titleEN,
      firstname,
      secondname,
      thirdname,
      fourthname,
      lastname,
      firstname_ar,
      secondname_ar,
      thirdname_ar,
      fourthname_ar,
      lastname_ar,
      gender,
      phonecode,
      mobile,
      email,
      user_category,
      contactname,
      contactcode,
      contactnumber
    } = data;

    this.personalInfoForm.patchValue({
      // ticket_reference_number,
      // order_id,
      // voucher_code,
      title,
      titleAR,
      titleEN,
      firstname,
      secondname,
      thirdname,
      fourthname,
      lastname,
      firstname_ar,
      secondname_ar,
      thirdname_ar,
      fourthname_ar,
      lastname_ar,
      gender,
      phonecode: phonecode || FORM_PLACEHOLDERS.phonecode,
      mobile: mobile,
      email,
      user_category,
      contactname,
      contactcode,
      contactnumber
    });
  }

  setTermsFormValue(data: any) {
    const { check, confirm, email_updates } = data;
    this.termsForm.patchValue({
      check,
      confirm,
      email_updates
    });
  }
  //#endregion form value set methods

  //#region form getters
  get af() {
    return this.applicationForm.controls;
  }

  get application_type() {
    return this.af.application_type;
  }

  get fan_category() {
    return this.af.fan_category;
  }

  get user_category() {
    return this.af.user_category;
  }

  get uf() {
    return this.uploadDocumentForm.controls;
  }

  get nationality() {
    return this.uf.nationality;
  }

  get document_type() {
    return this.uf.document_type;
  }

  get document_expiry() {
    return this.uf.document_expiry;
  }

  get document_number() {
    return this.uf.document_number;
  }

  get dateofbirth() {
    return this.uf.dateofbirth;
  }

  get pf() {
    return this.personalInfoForm.controls;
  }

  get firstname() {
    return this.pf.firstname;
  }

  get lastname() {
    return this.pf.lastname;
  }

  get gender() {
    return this.pf.gender;
  }
  //#endregion

  clearData() {
    const { email } = this.personalInfoForm.getRawValue();
    this.applicantForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.user_image_src = null;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.FaceIDScore = 100;
    this.DocQualityScore = '100';
    this.pf.contactcode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.qid_validated = false;
    this.face_validated = false;
    this.passport_validated = false;
    if(this.IschildApplication) {
      this.pf.email.patchValue(email, { emitEvent: false });
    }
  }

  //#region ocr methods
  async uploadDocument() {
    if(+this.submitReasonType === 2) {
      return;
    }

    const { document_type } = this.uploadDocumentForm.getRawValue();
    if(document_type === 1) {
      try {
        const { document_number: qid, dateofbirth } = this.uploadDocumentForm.getRawValue();
        const birthDate = convertNgbDateToISO(dateofbirth);
        const body: MoiEhterazValidationRequest = {
          qid,
          birthDate,
        };
        const response: unknown = await this.registrationFormService.applicant.validatePersonalDetails(body).toPromise();
        this.patchOCRFields(response);
        this.qid_validated = true;
      } catch (error) {
        console.log({ error });
        this.moi_error = true;
        this.qid_validated = false;
      }
    }
  }

  async patchOCRFields(response) {
    const {
      engName1: firstname,
      engName2: secondname,
      engName3: thirdname,
      engName4: fourthname,
      engName5: lastname,
      sex,
      arbName1: firstname_ar,
      arbName2: secondname_ar,
      arbName3: thirdname_ar,
      arbName4: fourthname_ar,
      arbName5: lastname_ar,
      idExpiryDateStr,
      natCode
    } = (response as {data})?.data || {};

    const gender = sex === '1' ? 'MALE' : 'FEMALE';
    const isNationalityArab = this.registrationFormService.metadata.getArabNationalities().includes(this.nationality.value);
    const document_expiry = convertDateStringToNgbDate(idExpiryDateStr);
    const nationality = await this.registrationFormService.metadata.getNationalityCodeFromNatCode(natCode).toPromise();
    const qidExists = await this.checkIfQIDExists(nationality);
    if (qidExists) {
      this.qid_exists_error = true;
      this.qid_validated = false;
      return;
    }
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.ocr_fields_patched = [];

    const ocr_fields_to_patch = [
      { value: firstname, field: this.pf.firstname },
      { value: secondname, field: this.pf.secondname },
      { value: thirdname, field: this.pf.thirdname },
      { value: fourthname, field: this.pf.fourthname },
      { value: lastname, field: this.pf.lastname },
      { value: 'QA', field: this.uf.issuing_country },
      ...( isNationalityArab ? [
        { value: firstname_ar, field: this.pf.firstname_ar },
        { value: secondname_ar, field: this.pf.secondname_ar },
        { value: thirdname_ar, field: this.pf.thirdname_ar },
        { value: fourthname_ar, field: this.pf.fourthname_ar },
        { value: lastname_ar, field: this.pf.lastname_ar },
      ] : []),
      ...( sex ? [{ value: gender, field: this.pf.gender }] : []),
      { value: idExpiryDateStr ? document_expiry : DIPLOMAT_QID_EXPIRY_DATE, field: this.uf.document_expiry },
      { value: nationality, field: this.uf.nationality }
    ]

    ocr_fields_to_patch.filter(({value, field})=> {
      value && this.ocr_fields_patched.push(field);
      return !!value;
    })
    .forEach(patchOCRfield);

  }

  checkIfQIDExists(nationality: string) {
    // const category = (this.isServiceCenter && !this.B2bApplicationInSC) ?
    //   { customerCategoryCode: this.fan_category.value } : { userCategoryCode: this.user_category.value };
    const category = { userCategoryCode: this.user_category.value, customerCategoryCode: this.fan_category.value };
    const body: IValidateEmailPhoneDocumentRequest = {
      type: 'doc',
      refNationality_Code: nationality,
      documentNo: this.uf.document_type.value + '-' + this.uf.document_number.value,
      eventcode: this.registrationFormService.menu.getSelectedEventCode(),
      fanIdNo: this.fanId,
      ...category,
      email: this.pf.email.value,
    }
    return this.registrationFormService.applicant.customerPortalValidateEmailPhoneDocument(body)
      .toPromise()
      .then(() => false)
      .catch(() => true);
  }

  onPassportNumberBlur() {
    const control = this.uf.document_number;
    const value = control.value;
    if (value) {
      // const category = (this.isServiceCenter && !this.B2bApplicationInSC) ?
      //   { customerCategoryCode: this.fan_category.value } : { userCategoryCode: this.user_category.value };
      const category = { userCategoryCode: this.user_category.value, customerCategoryCode: this.fan_category.value };
      const body = {
        type: 'doc',
        documentNo: this.document_type?.value + '-' + value,
        refNationality_Code: this.nationality.value,
        eventcode: localStorage.getItem('eventCode'),
        fanIdNo: this.fanId,
        ...category,
        email: this.pf.email.value,
      };
      const service$ = this.registrationFormService.applicant.customerPortalValidateEmailPhoneDocument(
        body
      );
      onUniqueFieldBlur(control, service$, 'notValidDoc');
    }
  }

  resetQidFields() {
    [
      ...(this.ocr_fields_patched.length ? this.ocr_fields_patched : [
        this.firstname,
        this.pf.secondname,
        this.pf.thirdname,
        this.pf.fourthname,
        this.lastname,
        this.gender
      ]),
      this.document_number,
      this.nationality,
      this.dateofbirth,
      this.document_expiry
    ].forEach(resetPatchedOCRfield);
    this.qid_validated = false;
  }

  resetPassportFields() {
    [
      this.uf.nationality,
      this.uf.issuing_country,
      this.uf.passportCategory,
      this.document_number,
      this.document_expiry,
      this.dateofbirth,
      this.firstname,
      this.pf.secondname,
      this.pf.thirdname,
      this.pf.fourthname,
      this.lastname,
      this.gender,
    ].forEach(resetPatchedOCRfield);
    this.passport_validated = false;
  }

  populatePersonalInfoFromQID(qidResult: OcrScanQidResultDto) {
    const {
      classificationScore, // documentscore
      dateOfBirth, // dd/mm/yyyy
      dateOfExpiry,
      name,
      qid,
    } = qidResult;

    const DateOfExpiry = convertDateStringToNgbDate(
      convertDateDDMMYYYYToMMDDYYYY(dateOfExpiry)
    );
    const DateOfBirth = convertDateStringToNgbDate(
      convertDateDDMMYYYYToMMDDYYYY(dateOfBirth)
    );

    this.DocQualityScore = classificationScore;

    let firstname, secondname, thirdname, fourthname, lastname;
    const name_array = name ? name.split(' ').filter(Boolean) : [];
    const name_array_length = name_array.length;

    switch (name_array_length) {
      case 1:
        [firstname] = name_array;
        break;
      case 2:
        [firstname, lastname] = name_array;
        break;
      case 3:
        [firstname, secondname, lastname] = name_array;
        break;
      case 4:
        [firstname, secondname, thirdname, lastname] = name_array;
        break;
      case 5:
      default:
        [firstname, secondname, thirdname, fourthname, lastname] = name_array;
        break;
    }

    const fields_to_patch = [
      {
        value: 'QA',
        field: this.uf.issuing_country,
      },
      {
        value: qid,
        field: this.document_number,
      },
      {
        value: DateOfExpiry,
        field: this.document_expiry,
      },
      {
        value: DateOfBirth,
        field: this.dateofbirth,
      },
      {
        value: firstname,
        field: this.firstname,
      },
      {
        value: secondname,
        field: this.pf.secondname,
      },
      {
        value: thirdname,
        field: this.pf.thirdname,
      },
      {
        value: fourthname,
        field: this.pf.fourthname,
      },
      {
        value: lastname,
        field: this.lastname,
      }
    ];
    fields_to_patch.forEach(patchOCRfield)

  }

  populatePersonalInfoFromPassport(passportResult: IRegulaPassportOCR) {
    const {
      firstName,
      secondName,
      thirdName,
      fourthName,
      fifthName,
      gender: sex,
      dateofBirth,
      nationality: _nationality,
      issuingCountry,
      docNumber,
      docSubType,
      expiryDate
    } = passportResult;

    const DateOfExpiry = convertDateStringToNgbDate(expiryDate);
    const DateOfBirth = convertDateStringToNgbDate(dateofBirth);

    let gender = null;
    if(sex === 'M') gender = 'MALE';
    else if(sex === 'F') gender = 'FEMALE';

    const [issuing_country, nationality] = [issuingCountry, _nationality].map(getCountryISO2);
    const passportCategory = getPassportOCRCategory(docSubType);

    const fields_to_patch = [
      {
        value: nationality,
        field: this.uf.nationality,
      },
      {
        value: issuing_country,
        field: this.uf.issuing_country,
      },
      {
        value: docNumber,
        field: this.document_number,
      },
      ...(passportCategory ? [{
        value: passportCategory,
        field: this.uf.passportCategory,
        disable: true
      }] : []),
      ...(expiryDate ? [{
        value: DateOfExpiry,
        field: this.document_expiry,
      }] : []),
      ...(dateofBirth ? [{
        value: DateOfBirth,
        field: this.dateofbirth,
      }] : []),
      {
        value: firstName,
        field: this.firstname,
      },
      {
        value: secondName,
        field: this.pf.secondname,
      },
      {
        value: thirdName,
        field: this.pf.thirdname,
      },
      {
        value: fourthName,
        field: this.pf.fourthname,
      },
      {
        value: fifthName,
        field: this.lastname,
      },
      {
        value: gender,
        field: this.gender,
      },
    ];
    fields_to_patch.forEach(({ value, field, disable }) => {
      patchOCRfield({ value, field, disable: !!disable })
    });
  }

  fetchPassportOCR() {
    this.resetPassportFields();
    const { user_image: profilePic, document_front: passportPic } = this.uploadDocumentForm.getRawValue();
    if (!profilePic || !passportPic) return;
    this.registrationFormService.applicant.getPassportOCR({ profilePic, passportPic })
      .pipe(take(1))
      .subscribe(
        res => {
          const { status, data } = res ?? {};
          if (status !== 200) {
            this.ocr_error = "Passport image is not valid. Please upload a valid image.";
            return;
          }
          if(data) {
            const isBelow10 = checkPassportDateOfBirthBelowYear(data.dateofBirth, 10);
            if(isBelow10 || parseFloat(data.faceMatchScore) >= MIN_FACE_MATCH_SCORE) {
              this.populatePersonalInfoFromPassport(data);
              this.onPassportNumberBlur();
              this.passport_validated = true;
            } else {
              this.ocr_error = "Please ensure that the uploaded profile & passport images coincide"
            }
          } else {
            this.ocr_error = "Something went wrong. Please try again."
          }
        }, err => {
          console.log('Passport OCR', err);
          this.passport_validated = false;
          this.ocr_error = "Something went wrong. Please try again."
        }
      )
  }

  onFaceValidationChange(face_validated: boolean) {
    this.face_validated = face_validated;
    if (this.isServiceCenter) {
      this.isProfilePicICAOComplains = face_validated;
      this.FaceIDScore = 100;
    }
  }

  closeOCRError() {
    this.ocr_error = null;
  }
  //#endregion ocr methods

  submitForm() {
    this.confirm_submit_open = true;
  }

  cancel() {
    this.redirectToList();
  }

  redirectToList() {
    if(this.from.bulkGroupName!=null && this.from.organizationId !=null && this.from.organizationName!=null ){
      this.router.navigate(['/main/bulk-groups/step-2'], {
        relativeTo: this.route,
        queryParams: {
          ...this.from
        }
      });
    }
    else{
      this.router.navigate(['main/all-applications/list']);
    }
  }

  getApplicationInsertBody(formValue: any[]): CustomerCardApplicationInsertRequest {
    return formValue.reduce(
      (prev, curr) => {
        const formComposed = this.registrationFormService.applicant.composeApplicationInsertRequest(
          curr
        );
        return { ...prev, ...formComposed };
      },
      {}
    );
  }

  async register() {
    const formValue = [
      this.applicationForm.getRawValue(),
      this.uploadDocumentForm.getRawValue(),
      this.personalInfoForm.getRawValue(),
      // this.preferredCollectionForm.getRawValue(),
      this.cardChoiceForm.getRawValue(),
      this.termsForm.getRawValue()
    ];

    if(this.isServiceCenter && !this.B2bApplicationInSC) {
      const { ticket_type, ticket_number, purpose_visit, purpose_visit_other }: { ticket_type: ITicketType, ticket_number: any, purpose_visit: string, purpose_visit_other: string } = this.ticketForm.getRawValue();
      const fan_category = ticket_type?.code ?? this.applicationForm.getRawValue()?.fan_category;
      const ticketFormValue = {
        ...(ticket_type?.ticketRequired ? {[ticket_type.ticketField]: ticket_number,} : {}),
        fan_category,
        purpose_visit,
        purpose_visit_other
      }
      formValue.push(ticketFormValue);

      const {
        country_birth, country_residence, previous_nationality,
        permit_document, visa_copy_document, job_title, job_title_other,
      } = this.residencyForm.getRawValue();
      const residencyFormValue = {
        country_birth,
        country_residence,
        previous_nationality,
        ...(isCountryGCC(country_residence) ? { permit_document } : {}),
        ...(ticket_type?.visaCopyRequired ? { visa_copy_document } : {}),
        job_title,
        job_title_other
      }
      // ...(ticket_type?.isGCC ? { permit_document } : {}),
      // commenting this code to remove the dependency of gcc
      formValue.push(residencyFormValue);

      const { accommodation_type, accommodation_name } = this.accommodationForm.getRawValue();
      const accommodationFormValue = { accommodation_type, accommodation_name };
      formValue.push(accommodationFormValue);
    }

    if (!this.isServiceCenter) {
      const {
        country_birth, country_residence, previous_nationality,
        job_title, job_title_other, permit_document, visa_copy_document
      } = this.residencyForm.getRawValue();
      let residencyFormValue = {
        country_birth,
        country_residence,
        previous_nationality,
        job_title,
        job_title_other
      }
      if (this.b2bVisaType === 'VISA') {
        const fan_category = this.applicationForm.getRawValue()?.fan_category;
        const ticket_type = TicketTypes.find(t => t.code === fan_category);
        residencyFormValue = {
          ...residencyFormValue,
          ...(isCountryGCC(country_residence) ? { permit_document } : {}),
          ...(ticket_type?.visaCopyRequired ? { visa_copy_document } : {}),
        }
      }
      formValue.push(residencyFormValue);
    }

    let applicationInsertBody = this.getApplicationInsertBody(formValue);
    let { DateofBirth, DocExpiryDate, arrivalDate } = applicationInsertBody;

    DateofBirth = convertNgbDateToISO(
      (DateofBirth as unknown) as NgbDateStruct
    );
    DocExpiryDate = convertNgbDateToISO(
      (DocExpiryDate as unknown) as NgbDateStruct
    );
    arrivalDate = convertNgbDateToISO(
      (arrivalDate as unknown) as NgbDateStruct
    );

    const userNo = localStorage.getItem('userId');
    const RefSystemUser_Id = this.RefSystemUser_Id != null ? this.RefSystemUser_Id : Number.parseInt(userNo);
    const Channel = this.isServiceCenter ? 2 : 8;

    const eventname = this.registrationFormService.menu.getSelectedEventCode();

    const [DocQualityScore, FaceIDScore, BackgroundCheckStatus, BioMatchId] = [
      +this.DocQualityScore,
      this.FaceIDScore,
      0,
      this.BioMatchId,
    ];

    const DocSubType = this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';

    //  1 - for excel upload
    //  2- bulk registration manual registration
    //  3 - SC registration
    const SubmissionType = this.submissionType;
    // convert medical array to csv
    let { RefMedicalInformation_Id } = applicationInsertBody;
    RefMedicalInformation_Id =
      ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

    const {
      EmergencyContactOneFullName, EmergencyContactOnePhone, EmergencyContactOnePhoneAreaCode,
      FirstName, PhoneAreaCode, Phone
    } = applicationInsertBody;

    const mediaProperties = MediaKeys.filter((key) => this.applicantData[key])
      .reduce((obj, key) => {
        obj[key] = this.applicantData[key];
        return obj;
      }, {});

    applicationInsertBody = {
      ...(this.isServiceCenter && { ...mediaProperties }),
      ...applicationInsertBody,
      RefMedicalInformation_Id,
      DateofBirth,
      DocExpiryDate,
      ...(arrivalDate && { arrivalDate }),
      RefSystemUser_Id,
      Channel,
      RefEvent_Code: eventname,
      DocQualityScore,
      FaceIDScore,
      BackgroundCheckStatus,
      BioMatchId,
      DocSubType,
      SubmissionType,
      ...(!this.IschildApplication
        ? { IsChildApplication: false }
        : {
            IsChildApplication: true,
            RefParentfanIdNo: this.RefParentfanIdNo,
          }),
      RefRegServiceCenter_Code: this.registrationFormService.menu.getTerminalCode(),
      EmergencyContactOneFullName: EmergencyContactOneFullName || FirstName,
      EmergencyContactOnePhoneAreaCode: EmergencyContactOnePhoneAreaCode || PhoneAreaCode,
      EmergencyContactOnePhone: EmergencyContactOnePhone || Phone,
      // EmergencyContactTwoFullName,
      // EmergencyContactTwoPhoneAreaCode,
      // EmergencyContactTwoPhone,
      // RefResidentCountry_Code: RefCurrentResidentCountry_Code,
      submitReasonType: +this.submitReasonType,
      FanIdNo: this.fanId,
      ApplicationNo: this.applicationNo,
      ...((this.from?.bulkGroupName != null || this.bulkGroupName) && {
        BulkGroupName: this.from?.bulkGroupName ?? this.bulkGroupName,
      }),
      ...(this.bulkGroupExtractId && {
        BulkGroupExtractId: this.bulkGroupExtractId,
      }),
      ...(!this.isServiceCenter && {
        OptInMarketing: true,
        ...(this.OrgGroupAccommodationAddress && {OrgGroupAccommodationAddress: this.OrgGroupAccommodationAddress})
      }),
      isProfilePicICAOComplains: this.isProfilePicICAOComplains,
      IcaoAndOcrError: this.icaoAndOcrError,
    };

    applicationInsertBody.RefCardDeliveryType_Code = this.cardDeliveryTypeCode ?? 'DHC';

    if (!arrivalDate) {
      delete applicationInsertBody.arrivalDate;
    }

    if (applicationInsertBody.RefDocType_Id === 1) {
      delete applicationInsertBody.DocSubType;
    }

    if (+this.submitReasonType === 6) {
      //Re-Apply
      // delete applicationInsertBody.ApplicationNo;
      applicationInsertBody.CancelledFanIdNo = applicationInsertBody.FanIdNo;
      // delete applicationInsertBody.FanIdNo;
    }

    let isConferencePublic = false;

    if (this.isServiceCenter) {
      delete applicationInsertBody.RefConferenceEvent_Id;
    } else {
      const b2bVisaType = getB2BVisaType(applicationInsertBody.RefCustomerCategory_Code);

      if (b2bVisaType === 'TRANSIT') {
        applicationInsertBody.RefRegUserCategory_Code = 'TRV';
      }

      if (b2bVisaType === 'VISA') {
        applicationInsertBody.RefRegUserCategory_Code = 'GP';
      }

      if (b2bVisaType !== 'CONFERENCE') {
        delete applicationInsertBody.RefConferenceEvent_Id;
      }

      isConferencePublic = this.conferenceType === 'PUBLIC';
      if (isConferencePublic) {
        const accreditationInsertBody = this.getAccreditationInsertBody(this.applicantForm);
        applicationInsertBody = { ...applicationInsertBody, ...accreditationInsertBody };
      }

    }

    this.registrationFormService.applicant
      .register(applicationInsertBody, { isAccreditation: isConferencePublic })
      .subscribe(
        () => {
          this.registrationFormService.spinner.hide('edit-info-submit');
          this.resubmit_success = true;
        },
        (err) => {
          console.log({ err });
          this.registrationFormService.spinner.hide('edit-info-submit');
          this.register_error = err?.error?.message || "Something went wrong!";
        }
      );
  }

  registerVIP() {
    try {
      const formValue = [
        this.applicationForm.getRawValue(),
        this.uploadDocumentForm.getRawValue(),
        this.personalInfoForm.getRawValue(),
        // this.preferredCollectionForm.getRawValue(),
        this.termsForm.value
      ];

      let applicationInsertBody = this.getApplicationInsertBody(formValue);

      let { DateofBirth, DocExpiryDate,arrivalDate } = applicationInsertBody;

      DateofBirth = convertNgbDateToISO(
        (DateofBirth as unknown) as NgbDateStruct
      );
      DocExpiryDate = convertNgbDateToISO(
        (DocExpiryDate as unknown) as NgbDateStruct
      );
      arrivalDate = convertNgbDateToISO(
        (arrivalDate as unknown) as NgbDateStruct
      );

      const userNo = localStorage.getItem('userId');
      const RefSystemUser_Id = this.RefSystemUser_Id != null ? this.RefSystemUser_Id : Number.parseInt(userNo);
      const Channel = this.isServiceCenter ? 2 : 8;

      const eventname = this.registrationFormService.menu.getSelectedEventCode();
      const [
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
      ] = [+this.DocQualityScore, this.FaceIDScore, 0, this.BioMatchId];

      const DocSubType = this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';
      //  1 - for excel upload
      //  2 - bulk registration manual registration
      //  3 - SC registration
      const SubmissionType = this.submissionType;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? '';

      const {
        EmergencyContactOneFullName, EmergencyContactOnePhone, EmergencyContactOnePhoneAreaCode,
        FirstName, PhoneAreaCode, Phone
      } = applicationInsertBody;

      applicationInsertBody = {
        ...applicationInsertBody,
        RefMedicalInformation_Id,
        DateofBirth,
        ...(arrivalDate && { arrivalDate }),
        ...(DocExpiryDate && { DocExpiryDate }),
        RefSystemUser_Id,
        Channel,
        RefEvent_Code: eventname,
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
        DocSubType,
        SubmissionType,
        ...(!this.IschildApplication
          ? { IsChildApplication: false }
          : {
              IsChildApplication: true,
              RefParentfanIdNo: this.RefParentfanIdNo,
            }),
        RefRegServiceCenter_Code: this.registrationFormService.menu.getTerminalCode(),
        EmergencyContactOneFullName: EmergencyContactOneFullName || FirstName,
        EmergencyContactOnePhoneAreaCode: EmergencyContactOnePhoneAreaCode || PhoneAreaCode,
        EmergencyContactOnePhone: EmergencyContactOnePhone || Phone,
        // EmergencyContactTwoFullName,
        // EmergencyContactTwoPhoneAreaCode,
        // EmergencyContactTwoPhone,
        // RefResidentCountry_Code: RefCurrentResidentCountry_Code,
        submitReasonType: +this.submitReasonType,
        FanIdNo: this.fanId,
        ApplicationNo: this.applicationNo,
        ...(this.from && this.from.bulkGroupName!=null && {
          BulkGroupName: this.from.bulkGroupName,
        }),
        ...(this.bulkGroupExtractId && {
          BulkGroupExtractId: this.bulkGroupExtractId,
        }),
        // DocImageFront,
        IsFromDirectReg: true,
        ...(!this.isServiceCenter && {
          OptInMarketing: true
        })
      };

      if(!DocExpiryDate) {
        delete applicationInsertBody.DocExpiryDate;
      }
      applicationInsertBody.RefCardDeliveryType_Code = this.cardDeliveryTypeCode ?? 'DHC';

      if(!arrivalDate) {
        delete applicationInsertBody.arrivalDate;
      }

      if(!applicationInsertBody.AccommodationPic) {
        delete applicationInsertBody.AccommodationPic;
      }

      if(+this.submitReasonType === 6) {
        //Re-Apply
        delete applicationInsertBody.ApplicationNo;
        applicationInsertBody.CancelledFanIdNo = applicationInsertBody.FanIdNo;
        delete applicationInsertBody.FanIdNo;
      }

      this.registrationFormService.applicant
      .register(applicationInsertBody)
      .pipe(take(1))
      .subscribe(
        () => {
          this.registrationFormService.spinner.hide('edit-info-submit');
          this.resubmit_success = true;
        },
        (err) => {
          this.registrationFormService.spinner.hide('edit-info-submit');
          this.register_error = err?.error?.message || "Something went wrong!";
        }
      );
    } catch (error) {
      console.log(error);
      this.registrationFormService.spinner.hide('edit-info-submit');
      this.register_error = "Something went wrong!";
    }
  }

  onRegisterError(event) {
    this.register_error = null
    event === 'close' || this.redirectToList();
  }

  closedialog(event: any) {
    this.confirm_submit_open = false;
    if(event === 'true'){

      this.register();
    }
  }

  onVisible(formGroup: FormGroup) {
    formGroup?.markAllAsTouched();
  }

  closeMOIError() {
    this.moi_error = false;
  }

  closeQidExistsError() {
    this.qid_exists_error = false;
  }

  proofOfAccoValidation() {
    if(this.document_type.value === 3){
      this.uf.document_proof.setValidators([
        Validators.required
      ])
      this.uf.document_proof_src.setValidators([
        Validators.required
      ])
      this.uf.document_proof.updateValueAndValidity();
      this.uf.document_proof_src.updateValueAndValidity();
    } else {
      this.uf.document_proof.clearValidators();
      this.uf.document_proof_src.clearValidators();
      this.uf.document_proof.updateValueAndValidity();
      this.uf.document_proof_src.updateValueAndValidity();
    }
  }

  onUpdateInfoAlertClose(action: 'proceed' | 'cancel') {
    this.show_update_info_alert = false;
    this.show_resubmit_alert = false;
    action === 'cancel' && this.redirectToList();
  }

  onCanUserApplyValid(valid: boolean) {
    this.canUserApplyValid = valid;
  }

  clearDataAFterSwitch(event) {
    const { email, mobile, phonecode } = this.personalInfoForm.getRawValue();
    if (this.isServiceCenter) {
      this.applicationForm.get('user_category').patchValue(null);
    }
    this.uploadDocumentForm.reset();
    this.personalInfoForm.reset();
    this.contactForm?.reset();
    this.cardChoiceForm.reset();
    this.termsForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.cardChoiceForm.get('receive_card').patchValue(false);
    // this.fan_category.patchValue('CG');
    this.pf.contactcode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.user_image_src = null;
    this.FaceIDScore = 100;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';
    this.qid_validated = false;
    this.canUserApplyValid = false;
    this.pf.email.enable();
    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.pf.email.patchValue(email, { emitEvent: false });
    this.pf.phonecode.patchValue(phonecode || FORM_PLACEHOLDERS.phonecode, { emitEvent: false });
    this.pf.mobile.patchValue(mobile, { emitEvent: false });
    this.passport_validated = false;
    this.face_validated = false;
    if (!this.isServiceCenter) {
      if (event === 'QRC') {
        // this.metadata$ = getMetadataFilteredByUserCategory({
        //   metadata$: this.metadata$,
        //   userCategoryCodes: INVALID_USER_CATEGORIES_CODE_FOR_QID,
        //   filter_out: true
        // });
      } else {
        this.metadata$ = getMetadataFilteredByUserCategory({ metadata$: this._metadata$ });
      }
    } else {
      this.ticketForm?.patchValue({
        ticket_type: TicketTypes.find(t => t.code === 'NHWM'),
        ticket_number: '',
        ticket_valid: false
      })
      this.ticketForm?.enable();
    }
  }
}
