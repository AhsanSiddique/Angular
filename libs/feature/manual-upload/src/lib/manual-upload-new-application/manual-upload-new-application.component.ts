import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  BulkGroupService,
  CustomerCardApplicationInsertRequest,
  IRegulaPassportOCR,
  IValidateEmailPhoneDocumentRequest,
  MetadataResolve,
  MoiEhterazValidationRequest,
  OcrScanQidResultDto
} from "@fan-id/api/server";
import { RegistrationFormService } from "@fan-id/core";
import { AccreditationForm, UploadDocumentFormComponent, UploadDocumentFormLocalComponent } from "@fan-id/shared/shared-forms";
import { Observable, Subject } from "rxjs";
import { first, map, take, takeUntil } from "rxjs/operators";
import { convertNgbDateToISO, convertDateStringToNgbDate, convertDateDDMMYYYYToMMDDYYYY, validateDateOfExpiry, checkPassportDateOfBirthBelowYear, DIPLOMAT_QID_EXPIRY_DATE } from "@fan-id/shared/utils/date";
import { FORM_PLACEHOLDERS, getB2BVisaType, getFormExtras, getMetadataFilteredByUserCategory, getPassportOCRCategory, IFormExtras, INVALID_USER_CATEGORIES_CODE_FOR_QID, isCountryGCC, MIN_FACE_MATCH_SCORE, onUniqueFieldBlur, patchOCRfield, resetPatchedOCRfield, TicketTypes, updateFormExtras } from '@fan-id/shared/utils/form';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import * as getCountryISO2 from 'country-iso-3-to-2';

@Component({
  selector: 'fan-id-manual-upload-new-application',
  templateUrl: './manual-upload-new-application.component.html',
  styleUrls: ['./manual-upload-new-application.component.scss'],
})
export class ManualUploadNewApplicationComponent extends AccreditationForm implements OnInit, OnDestroy {
  qid_exists_error: boolean;
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private registrationFormService: RegistrationFormService,
    private bulkGroupService: BulkGroupService,
  ) {
    super();
  }
  private readonly unsubscribe$ = new Subject<void>();

  translateKey = 'ManualStep2';
  eventName = '';

  @ViewChild(UploadDocumentFormComponent)
  private uploadFormComponent: UploadDocumentFormComponent;

  @ViewChild(UploadDocumentFormLocalComponent)
  private uploadFormLocalComponent: UploadDocumentFormLocalComponent;

  newCustomerForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  residencyForm: FormGroup;
  personalInfoForm: FormGroup;
  contactForm: FormGroup;
  cardChoiceForm: FormGroup;
  termsForm: FormGroup;

  metadata$: Observable<MetadataResolve>;
  _metadata$: Observable<MetadataResolve>;

  loading = false;
  loadingtext = 'Processing';
  upload_form_submitted = false;

  show_cancel_modal = false;
  register_error_message = '';

  FaceIDScore: number;
  BioMatchId: string;
  DocQualityScore: string;
  RefParentFanIdNo: string;
  ocr_error: string;
  parent_error: boolean;
  moi_error: boolean;
  register_error: boolean;
  register_success: boolean;
  isDependent = false;
  formSubmitted = false;
  ocr_fields_patched: AbstractControl[] = [];
  show_confirm_register_modal = false;
  qid_validated = false;
  passport_validated = false;
  face_validated = false;
  canUserApplyValid = false;
  emergencyContact: Partial<CustomerCardApplicationInsertRequest> = {
    EmergencyContactOneFullName: null,
    EmergencyContactOnePhoneAreaCode: null,
    EmergencyContactOnePhone: null
  };
  bulkGroupName: string;
  orgGroupAccommodationAddress: string;

  ngOnInit() {
    this.registrationFormService.scroll.scrollToTop();
    this._metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.resetMetadata();
    this.RefParentFanIdNo = this.route.snapshot.queryParamMap.get(
      'parentfanid'
    );
    this.setEventName();
    this.initializeForms();
    this.initializeAccreditationForm(this.newCustomerForm);
    // this.onApplicationTypeChange();
    this.setVIPValidations();
    this.getEmergencyContact();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setEventName() {
    this.eventName = this.registrationFormService.menu.getSelectedEvent() || '';
  }

  getEmergencyContact() {
    const userOrganizationId = parseInt(localStorage.getItem('organizationId'));
    this.bulkGroupService
    .getOrganization(userOrganizationId)
    .pipe(first())
    .subscribe(
      (response) => {
        const data = response?.data ?? {};
        const {
          phoneAreaCode: EmergencyContactOnePhoneAreaCode,
          name: orgName,
          contactName,
          phoneNumber: EmergencyContactOnePhone,
        } = data;

        let EmergencyContactOneFullName = contactName ?? orgName;
        // remove special characters, spaces, and digits. 20 char limit
        EmergencyContactOneFullName = EmergencyContactOneFullName.replace(
          /[^a-zA-Z]/g,
          ' '
        )
          .trim()
          .split(' ')[0]
          .slice(0, 20);
        this.emergencyContact = {
          EmergencyContactOneFullName,
          EmergencyContactOnePhoneAreaCode,
          EmergencyContactOnePhone
        }
      },
      (error) => console.error(error)
    );
  }

  initializeForms() {
    this.newCustomerForm = this.fb.group({
      applicationForm: this.fb.group({
        application_type: ['Other'],
        gcc_country: [''],
        fan_category: [null, Validators.required],
        current_country: [null],
        // nationality: [null],
        estimated_arrival: [null],
        user_category: [null, Validators.required],
        conference_name: [null],
        purpose_visit: [null],
        purpose_visit_other: [''],
        conference_profile: [null],
      }),

      uploadDocumentForm: this.fb.group({
        user_image: ['', Validators.required],
        user_image_src: ['', Validators.required],
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
        passportCategory:[null, Validators.required],
        nationality: [null, Validators.required],
      }),

      residencyForm: this.fb.group({
        country_birth: [null],
        country_residence: [null],
        previous_nationality: [null],
        has_previous_nationality: [''],
        job_title: [null],
        job_title_other: [''],
        permit_document: [null],
        visa_copy_document: [null],
      }),

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
        phonecode: [FORM_PLACEHOLDERS.phonecode],
        mobile: [FORM_PLACEHOLDERS.mobile],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(40)]],
        medical:[[]]
      }),

      contactForm: this.fb.group({
        phonecode: [FORM_PLACEHOLDERS.phonecode],
        mobile: [''],
        emergencyPhoneCode: [null],
        emergencyPhoneNumber: [''],
      }),

      cardChoiceForm: this.fb.group({
        receive_card: [false],
      }),

      termsForm: this.fb.group({
        check: [false],
        confirm: [false],
        email_updates: [false]
      }),

      extras: [{ manualUpload: true } as IFormExtras]
    });

    this.applicationForm = this.newCustomerForm.get('applicationForm') as FormGroup;
    this.uploadDocumentForm = this.newCustomerForm.get('uploadDocumentForm') as FormGroup;
    this.residencyForm = this.newCustomerForm.get('residencyForm') as FormGroup;
    this.personalInfoForm = this.newCustomerForm.get('personalInfoForm') as FormGroup;
    this.cardChoiceForm = this.newCustomerForm.get('cardChoiceForm') as FormGroup;
    this.termsForm = this.newCustomerForm.get('termsForm') as FormGroup;
    this.contactForm = this.newCustomerForm.get('contactForm') as FormGroup;
  }

  get b2bVisaType() {
    return getFormExtras(this.newCustomerForm)?.b2bVisaType;
  }

  get conferenceType() {
    if (this.b2bVisaType !== 'CONFERENCE') return null;
    return getFormExtras(this.newCustomerForm)?.conferenceType;
  }

  resetMetadata() {
    this.metadata$ = getMetadataFilteredByUserCategory({ metadata$: this._metadata$, filterDefaults: ['SFP'] });
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

  clearData() {
    const { fan_category, conference_name } = this.applicationForm.getRawValue();
    const { email, phonecode, mobile } = this.personalInfoForm.getRawValue();
    const { emergencyPhoneCode, emergencyPhoneNumber } = this.contactForm.getRawValue();
    this.newCustomerForm.reset();
    updateFormExtras(this.newCustomerForm, { manualUpload: true });
    this.termsForm.get('email_updates').patchValue(false);
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.user_image_src = null;
    this.upload_form_submitted = false;
    this.qid_validated = false;
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.mobile.patchValue(FORM_PLACEHOLDERS.mobile);
    this.pf.email.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.FaceIDScore = null;
    this.BioMatchId = null;
    this.DocQualityScore = null;
    if (this.isDependent) {
      this.pf.email.patchValue(email, { emitEvent: false });
      this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
      this.pf.mobile.patchValue(mobile, { emitEvent: false });
      this.af.fan_category.patchValue(fan_category);
      this.af.conference_name.patchValue(conference_name);
      const contactFormValue = { phonecode, mobile, emergencyPhoneCode, emergencyPhoneNumber };
      this.contactForm.setValue(contactFormValue);
    }
    this.canUserApplyValid = false;
  }

  onApplicationTypeChange() {
    this.application_type.valueChanges.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(val => {
      if(val) {
        const fields_to_reset = [
          ...this.ocr_fields_patched,
          this.document_number,
          this.nationality,
          this.dateofbirth,
          this.document_expiry,
          this.uf.issuing_country
        ]
        fields_to_reset.forEach(resetPatchedOCRfield);
      }
    });
  }

  get documentInformationSectionValid() {
    return this.uploadDocumentForm.valid &&
      (this.pf.email.disabled ? true : this.pf.email.valid) &&
      this.face_validated &&
      this.passport_validated &&
      this.canUserApplyValid;
  }

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

  onVisible(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
  }

  //#region ocr methods
  async uploadDocument() {
    const { document_type } = this.uploadDocumentForm.getRawValue();
    if(document_type === 3) {
      this.upload_form_submitted = true;
    } else {
      try {
        const { document_number: qid, dateofbirth } = this.uploadDocumentForm.getRawValue();
        const birthDate = convertNgbDateToISO(dateofbirth);
        const body: MoiEhterazValidationRequest = {
          qid,
          birthDate
        };
        const response: unknown = await this.registrationFormService.applicant.validatePersonalDetails(body).toPromise();
        console.log({ response });
        await this.patchOCRFields(response)
        this.upload_form_submitted = true;
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
    const body: IValidateEmailPhoneDocumentRequest = {
      type: 'doc',
      refNationality_Code: nationality,
      documentNo: this.uf.document_type.value + '-' + this.uf.document_number.value,
      eventcode: this.registrationFormService.menu.getSelectedEventCode(),
      userCategoryCode: this.af.user_category.value
    }
    return this.registrationFormService.applicant.customerPortalValidateEmailPhoneDocument(body)
      .toPromise()
      .then(() => false)
      .catch(() => true);
  }

  onPassportNumberBlur() {
    const control = this.uf.document_number;
    const value = control.value;
    if (!value) return;
    const conferenceEventId = this.af.conference_name.value;
    const userCategoryCode = this.b2bVisaType === 'TRANSIT' ? 'TRV' : this.af.user_category.value;
    const customerCategoryCode = this.af.fan_category.value;
    const body = {
      type: 'doc',
      documentNo: this.document_type?.value + '-' + value,
      refNationality_Code: this.nationality.value,
      eventcode: localStorage.getItem('eventCode'),
      userCategoryCode,
      ...(this.b2bVisaType === 'CONFERENCE' && { conferenceEventId }),
      customerCategoryCode,
      email: this.pf.email.value,
    };
    const service$ = this.registrationFormService.applicant.customerPortalValidateEmailPhoneDocument(
      body
    );
    onUniqueFieldBlur(control, service$, 'notValidDoc');
  }

  resetQidFields() {
    [
      ...this.ocr_fields_patched,
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

    const isDateOfExpiryValid = validateDateOfExpiry(DateOfExpiry);

    if (!isDateOfExpiryValid) {
      this.ocr_error = "QID should have a minimum validity of 6 months from the start date of the tournament. Please upload a valid document"
      return;
    }

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
      },
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
  }

  closeOCRError() {
    if(this.ocr_error !== 'error') {
      this.upload_form_submitted = false;
    }
    this.ocr_error = null;
  }
  //#endregion ocr methods

  cancel() {
    this.router.navigate(['/main/dashboard']);
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

  register() {
    try {
      const isVisaTransitOrConferencePrivate = this.b2bVisaType === 'TRANSIT' || this.conferenceType === 'PRIVATE';
      const formValue = [
        this.applicationForm.getRawValue(),
        this.uploadDocumentForm.getRawValue(),
        // this.residencyForm.getRawValue(),
        this.personalInfoForm.getRawValue(),
        ...(isVisaTransitOrConferencePrivate ? [{}] : [this.contactForm.getRawValue()]),
        // this.preferredCollectionForm.getRawValue(),
        this.cardChoiceForm.value,
        this.termsForm.value
      ];

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

      const Channel = 8;
      const eventname = this.registrationFormService.menu.getSelectedEventCode();
      const [
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
      ] = [100, 100, 0, this.registrationFormService.applicant.generateDefaultBiomatchID()];

      const DocSubType = this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';
      //  1 - for excel upload
      //  2 - bulk registration manual registration
      //  3 - SC registration
      const SubmissionType = 2;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

      applicationInsertBody = {
        ...applicationInsertBody,
        RefMedicalInformation_Id,
        DateofBirth,
        DocExpiryDate,
        ...(arrivalDate && { arrivalDate }),
        Channel,
        RefEvent_Code: eventname,
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
        DocSubType,
        SubmissionType,
        ...this.emergencyContact,
        submitReasonType: 1,
        ...(this.RefParentFanIdNo
          ? {
              RefParentFanIdNo: this.RefParentFanIdNo,
              IsChildApplication: true,
              OrgGroupAccommodationAddress: this.orgGroupAccommodationAddress,
            }
          : { IsChildApplication: false }),
        RefOrganization_Id: parseInt(localStorage.getItem('organizationId')),
        BulkGroupName: this.bulkGroupName,
        OptInMarketing: true
      };

      applicationInsertBody.RefCardDeliveryType_Code = 'DHC';

      if(!arrivalDate) {
        delete applicationInsertBody.arrivalDate;
      }

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

      if(!applicationInsertBody.AccommodationPic) {
        delete applicationInsertBody.AccommodationPic;
      }

      const isConferencePublic = this.conferenceType === 'PUBLIC';
      if (isConferencePublic) {
        const accreditationInsertBody = this.getAccreditationInsertBody(this.newCustomerForm);
        applicationInsertBody = { ...applicationInsertBody, ...accreditationInsertBody };
      }

      return this.registrationFormService.applicant
        .register(applicationInsertBody, { isAccreditation: isConferencePublic })
        .toPromise();
    } catch (error) {
      console.log(error);
      return Promise.reject({ error: { message: 'Something went wrong!' } });
    }
  }

  registerVIP() {
    try {
      const formValue = [
        this.applicationForm.value,
        this.uploadDocumentForm.value,
        this.personalInfoForm.getRawValue(),
        // this.preferredCollectionForm.getRawValue(),
        this.termsForm.value
      ];

      let applicationInsertBody = this.getApplicationInsertBody(formValue);

      let { DocImageFront } = applicationInsertBody;
      DocImageFront = DocImageFront || applicationInsertBody?.ProfilePic;

      const { RefCurrentResidentCountry_Code } = applicationInsertBody;

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

      const Channel = 8;
      const eventname = this.registrationFormService.menu.getSelectedEventCode();
      const [
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
      ] = [100, 100, 0, this.registrationFormService.applicant.generateDefaultBiomatchID()];

      const DocSubType = this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';
      //  1 - for excel upload
      //  2 - bulk registration manual registration
      //  3 - SC registration
      const SubmissionType = 2;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

      applicationInsertBody = {
        ...applicationInsertBody,
        RefMedicalInformation_Id,
        DateofBirth,
        ...(arrivalDate && { arrivalDate }),
        ...(DocExpiryDate && { DocExpiryDate }),
        Channel,
        RefEvent_Code: eventname,
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
        DocSubType,
        SubmissionType,
        ...this.emergencyContact,
        RefResidentCountry_Code: RefCurrentResidentCountry_Code,
        submitReasonType: 1,
        ...(this.RefParentFanIdNo
          ? {
              RefParentFanIdNo: this.RefParentFanIdNo,
              IsChildApplication: true,
            }
          : { IsChildApplication: false }),
        DocImageFront,
        IsFromDirectReg: true,
        RefCustomerCategory_Code: 'CG',
        RefOrganization_Id: parseInt(localStorage.getItem('organizationId')),
        BulkGroupName: this.bulkGroupName,
        OptInMarketing: true
      };

      if(!DocExpiryDate) {
        delete applicationInsertBody.DocExpiryDate;
      }

      if(!arrivalDate) {
        delete applicationInsertBody.arrivalDate;
      }

      if(!applicationInsertBody.AccommodationPic) {
        delete applicationInsertBody.AccommodationPic;
      }

      return this.registrationFormService.applicant
        .register(applicationInsertBody)
        .pipe(take(1))
        .toPromise();
    } catch (error) {
      console.log(error);
      return Promise.reject({ error: { message: 'Something went wrong!' } });
    }
  }

  registerCustomer() {
    this.formSubmitted = true;
    this.registrationFormService.spinner.show('new-customer-register');

    if(this.fan_category.value === 'VIP') {
      this.registerVIP()
        .then(this.onRegisterSuccess.bind(this))
        .catch(this.onRegisterError.bind(this));
      return;
    }

    this.register()
      .then(this.onRegisterSuccess.bind(this))
      .catch(this.onRegisterError.bind(this));
  }

  closeMOIError() {
    this.moi_error = false;
  }

  closeQidExistsError() {
    this.qid_exists_error = false;
  }

  closeRegisterError() {
    this.register_error = false;
  }

  closeRegisterSuccess() {
    this.router.navigate(['/main/dashboard']);
  }

  redirectToAllApplications() {
    this.router.navigate(['/main/all-applications/list']);
  }

  onConfirmRegisterModal(action: 'proceed' | 'close') {
    this.show_confirm_register_modal = false;
    if (action === 'proceed') {
      this.registerCustomer();
    }
  }

  onRegisterSubmit() {
    this.show_confirm_register_modal = true;
  }

  onRegisterSuccess() {
    this.loading = false;
    this.registrationFormService.spinner.hide('new-customer-register');
    this.formSubmitted = false;
    this.register_success = true;
  }

  onRegisterError(err) {
    console.log({ err });
    this.registrationFormService.spinner.hide('new-customer-register');
    this.register_error_message =
      err?.error?.message || 'Something went wrong!';
    this.loading = false;
    this.register_error = true;
    this.formSubmitted = false;
  }

  onCanUserApplyValid(valid: boolean) {
    this.canUserApplyValid = valid;
  }

  clearDataAFterSwitch(event) {
    console.log('ApplicationType Changed', event);
    const { email, phonecode, mobile } = this.personalInfoForm.getRawValue();
    this.uploadDocumentForm.reset({onlySelf: true, emitEvent: false});
    this.personalInfoForm.reset();
    this.cardChoiceForm.reset();
    this.termsForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.cardChoiceForm.get('receive_card').patchValue(false);
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.mobile.patchValue(FORM_PLACEHOLDERS.mobile);
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.user_image_src = null;
    this.upload_form_submitted = false;
    this.FaceIDScore = 100;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';
    this.pf.email.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.qid_validated = false;
    this.passport_validated = false;
    this.face_validated = false;
    if(this.isDependent) {
      this.pf.email.patchValue(email, { emitEvent: false });
      this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
      this.pf.mobile.patchValue(mobile, { emitEvent: false });
    }
    if (event === 'QRC') {
      this.user_category.patchValue(null);
      this.user_category.markAsUntouched();
      this.metadata$ = getMetadataFilteredByUserCategory({
        metadata$: this.metadata$,
        userCategoryCodes: INVALID_USER_CATEGORIES_CODE_FOR_QID,
        filter_out: true
      });
    } else {
      this.resetMetadata();
    }
  }
}
