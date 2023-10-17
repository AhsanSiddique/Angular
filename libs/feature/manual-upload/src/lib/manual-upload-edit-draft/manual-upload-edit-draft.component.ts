import { Component, Input, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  CreateBulkRegistrationDraftInsertRequestList,
  CustomerCardApplicationGetListResponse,
  CustomerCardApplicationInsertRequest,
  ESubmissionType,
  IRegulaPassportOCR,
  IValidateEmailPhoneDocumentRequest,
  MetadataResolve,
  MoiEhterazValidationRequest,
  OcrScanQidResultDto
} from "@fan-id/api/server";
import { RegistrationFormService } from "@fan-id/core";
import { AccreditationForm, PersonalInformationFormComponent, UploadDocumentFormComponent } from "@fan-id/shared/shared-forms";
import { getFromLocalStorage } from '@fan-id/shared/utils/common';
import {
  DIPLOMAT_QID_EXPIRY_DATE,
  checkPassportDateOfBirthBelowYear,
  convertDateDDMMYYYYToMMDDYYYY,
  convertDateStringToNgbDate,
  convertNgbDateToISO
} from '@fan-id/shared/utils/date';
import {
  CATEGORIES_WITH_GCC_PERMIT_SC,
  EPassportCategory,
  FORM_PLACEHOLDERS,
  IFormExtras,
  MIN_FACE_MATCH_SCORE,
  TicketTypes,
  getB2BVisaType,
  getFormExtras,
  getPassportOCRCategory,
  isCountryGCC,
  onUniqueFieldBlur,
  patchOCRfield,
  resetPatchedOCRfield,
  updateFormExtras,
} from '@fan-id/shared/utils/form';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import * as getCountryISO2 from 'country-iso-3-to-2';
import { Observable, throwError } from "rxjs";
import { catchError, delay, map, take, tap } from "rxjs/operators";

@Component({
  selector: 'fan-id-manual-upload-edit-draft',
  templateUrl: './manual-upload-edit-draft.component.html',
  styleUrls: ['./manual-upload-edit-draft.component.scss'],
})
export class ManualUploadEditDraftComponent extends AccreditationForm implements OnInit {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private registrationFormService: RegistrationFormService,
    private sanitizer: DomSanitizer
  ) {
    super();
  }

  translateKey = 'EditApplication';
  show_cancel_modal = false;

  @ViewChild(UploadDocumentFormComponent, { static: true })
  private uploadFormComponent!: UploadDocumentFormComponent;

  @ViewChild(PersonalInformationFormComponent, { static: true })
  private personalFormComponent!: PersonalInformationFormComponent;

  applicantForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  residencyForm: FormGroup;
  personalInfoForm: FormGroup;
  cardChoiceForm: FormGroup;
  termsForm: FormGroup;
  contactForm: FormGroup;

  metadata$: Observable<MetadataResolve>;

  confirm_submit_open = false;
  draftId: string;
  applicationNo: string;
  submitReasonType: string;

  applicant_error: string;
  register_error: string;

  FaceIDScore: number;
  BioMatchId: string;
  DocQualityScore: string;
  RefSystemUser_Id: number;
  ocr_error: string;
  moi_error: boolean;

  eventCode: string;
  organizationId: number;
  bulkGroupName: string;
  serviceCenterCode: string;
  customObj: any;
  UiFeature: string;
  type: string;
  excelRefid: string;
  extractionId: string;
  @Input() feature? = 'manual-upload';
  @Input() _draftId?: string;
  @Input() _metadata$?: Observable<MetadataResolve>;
  isExcel = false;
  isQidCallDone = true;
  ocr_fields_patched: AbstractControl[] = [];
  qid_validated = false;
  passport_validated = false;
  face_validated = false;
  processing = false;
  processingdata = { totalCount: 0 };
  IschildApplication = false;
  RefParentfanIdNo: string;
  OrgGroupAccommodationAddress: string;
  SubmissionType = ESubmissionType.MANUAL;
  qid_exists_error: boolean;
  isProfilePicICAOComplains: boolean;
  icaoAndOcrError: string;
  canUserApplyValid = false;

  ngOnInit() {
    this.UiFeature = this.feature;
    if (this.feature === 'manual-upload') {
      this.draftId = this.route.snapshot.queryParamMap.get('id');
      this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
      this.type = 'submit';
    } else if (this.feature === 'bulk-upload-draft') {
      this.draftId = this.route.snapshot.queryParamMap.get('id');
      this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
      const hy = history.state;
      this.customObj = hy.data;
      this.isQidCallDone = this.customObj['isQidCallDone'];
      this.type = 'save';
      this.isExcel = true;
    } else if (this.feature === 'bulk-upload-non-draft') {
      this.draftId = this.route.snapshot.queryParamMap.get('id');
      this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
      const hy = history.state;
      this.customObj = hy.data;
      this.isQidCallDone = this.customObj['isQidCallDone'];
      this.type = 'save';
      this.isExcel = true;
    } else if (this.feature === 'package-upload-draft' || this.feature === 'package-excel-upload-draft') {
      this.draftId = this.route.snapshot.queryParamMap.get('id');
      this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
      this.type = 'save';
      this.isExcel = true;
    } else if (this.feature === 'package-upload-non-draft') {
      this.draftId = this.route.snapshot.queryParamMap.get('id');
      this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
      const hy = history.state;
      this.customObj = hy.data;
      this.type = 'save';
      this.isExcel = true;
    } else {
      this.draftId = this._draftId;
      this.metadata$ = this._metadata$;
      this.type = 'submit';
      this.isExcel = true;
    }

    this.initializeForms();
    this.initializeAccreditationForm(this.applicantForm);
    console.log('Set Card Application ', this.customObj);
    this.registrationFormService.scroll.scrollToTop();
  }

  initializeForms() {
    this.applicantForm = this.fb.group({
      applicationForm: this.fb.group({
        application_type: [null, Validators.required],
        gcc_country: [''],
        fan_category: [null, Validators.required],
        current_country: [null],
        // nationality: [null, Validators.required],
        estimated_arrival: [null],
        user_category: [null, Validators.required],
        conference_name: [null],
        purpose_visit: [null],
        purpose_visit_other: [''],
        conference_profile: [null],
      }),

      uploadDocumentForm: this.fb.group({
        user_image: ['', Validators.required],
        user_image_url: [''],
        user_image_src: [''],
        document_type: ['', Validators.required],
        document_front: [''],
        document_front_src: [''],
        document_proof: [''],
        document_proof_src: [''],
        document_number: ['', Validators.required],
        document_expiry: [null, Validators.required],
        dateofbirth: ['', Validators.required],
        issuing_country: [null, Validators.required],
        passportCategory: [null, Validators.required],
        PrintedQID: [''],
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
        medical: [[]],
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
        email_updates: [false],
      }),

      extras: [{ manualUpload: true } as IFormExtras]
    });

    this.applicationForm = this.applicantForm.get('applicationForm') as FormGroup;
    this.uploadDocumentForm = this.applicantForm.get('uploadDocumentForm') as FormGroup;
    this.residencyForm = this.applicantForm.get('residencyForm') as FormGroup;
    this.personalInfoForm = this.applicantForm.get('personalInfoForm') as FormGroup;
    this.cardChoiceForm = this.applicantForm.get('cardChoiceForm') as FormGroup;
    this.termsForm = this.applicantForm.get('termsForm') as FormGroup;
    this.contactForm = this.applicantForm.get('contactForm') as FormGroup;
  }

  get b2bVisaType() {
    return getFormExtras(this.applicantForm)?.b2bVisaType;
  }

  get conferenceType() {
    if (this.b2bVisaType !== 'CONFERENCE') return null;
    return getFormExtras(this.applicantForm)?.conferenceType;
  }

  //#region form value set methods
  setApplicationFormValue(data: any) {
    const {
      application_type,
      // gcc_country,
      fan_category,
      // current_country,
      // nationality,
      estimated_arrival,
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
      estimated_arrival,
      user_category,
      conference_name,
      purpose_visit,
      purpose_visit_other,
      conference_profile
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
      nationality,
      // printedQID
    } = data;
    this.uploadDocumentForm.patchValue({
      // user_image_url,
      document_type,
      document_number,
      dateofbirth,
      document_expiry,
      issuing_country,
      passportCategory,
      nationality,
      // printedQID
    });

    if(passportCategory === EPassportCategory.TRAVELDOCUMENT) this.uf.passportCategory.disable();
    this.registrationFormService.spinner.show('upload-info-image');
    const userImageUrl = this.registrationFormService.applicant.composeImageUrl(
      profilePic,
      true,
    );
    if (userImageUrl) {
      const imageBlob = await this.registrationFormService.applicant
        .getImageBlob(userImageUrl)
        .pipe(take(1))
        .toPromise()
        .catch((err) => {
          console.log('userImageBlob', err);
          return null;
        });

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
      true,
    );
    if (docImageUrl) {
      const imageBlob = await this.registrationFormService.applicant
        .getImageBlob(docImageUrl)
        .pipe(take(1))
        .toPromise()
        .catch((err) => {
          console.log('docImageBlob', err);
          return null;
        });
      if (imageBlob) {
        this.uf.document_front.patchValue(imageBlob);
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        reader.onload = () => {
          this.uf.document_front_src.patchValue(reader.result as string);
        };
      }
    }
    this.registrationFormService.spinner.hide('upload-info-image');
  }

  async setResidencyFormValue(data: any) {
    const {
      country_birth, country_residence, previous_nationality,
      visa_copy_document, permit_document, job_title, job_title_other,
    } = data;
    const fan_category = this.applicationForm.getRawValue().fan_category;
    const ticket_type = TicketTypes.find(t => t.code === fan_category);

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

  setPersonalInfoFormValue(data: any) {
    const {
      ticket_reference_number,
      order_id,
      voucher_code,
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
      // user_category,
    } = data;

    if (this.qid_validated) {
      this.ocr_fields_patched = [
        this.firstname,
        this.pf.secondname,
        this.pf.thirdname,
        this.pf.fourthname,
        this.pf.lastname,
        this.gender,
      ];
    }

    this.personalInfoForm.patchValue({
      ticket_reference_number,
      order_id,
      voucher_code,
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
      // user_category,
    });
  }

  setTermsFormValue(data: any) {
    const { check, confirm, email_updates } = data;
    this.termsForm.patchValue({
      check,
      confirm,
      email_updates,
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
  //#endregion uploadDocumentForm getters

  clearData() {
    const { email, phonecode, mobile } = this.personalInfoForm.getRawValue();
    const { fan_category, conference_name, user_category } = this.applicationForm.getRawValue();
    this.applicantForm.reset();
    updateFormExtras(this.applicantForm, { manualUpload: true });
    this.termsForm.get('email_updates').patchValue(false);
    this.cardChoiceForm.get('receive_card').patchValue(false);
    this.fan_category.patchValue(fan_category);
    this.af.conference_name.patchValue(conference_name);
    this.user_category.patchValue(user_category);
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.mobile.patchValue(FORM_PLACEHOLDERS.mobile);
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.user_image_src = null;
    this.FaceIDScore = 100;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';
    this.qid_validated = false;
    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.passport_validated = false;
    this.face_validated = false;
    this.canUserApplyValid = false;

    if(this.IschildApplication) {
      this.pf.email.patchValue(email, { emitEvent: false });
      this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
      this.pf.mobile.patchValue(mobile, { emitEvent: false });
    }
  }

  //#region ocr methods
  async uploadDocument() {
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.FaceIDScore = 100;
    this.DocQualityScore = '100';

    const { document_type } = this.uploadDocumentForm.getRawValue();
    if (document_type === 1) {
      try {
        const {
          document_number: qid,
          dateofbirth,
        } = this.uploadDocumentForm.getRawValue();
        const birthDate = convertNgbDateToISO(dateofbirth);
        const body: MoiEhterazValidationRequest = {
          qid,
          birthDate,
        };
        const response: unknown = await this.registrationFormService.applicant
          .validatePersonalDetails(body)
          .toPromise();
        console.log({ response });
        await this.patchOCRFields(response);
        this.qid_validated = true;
      } catch (error) {
        console.log({ error });
        this.moi_error = true;
        this.qid_validated = false;
      }
    }
  }

  resetQidFields() {
    [
      ...this.ocr_fields_patched,
      this.document_number,
      this.nationality,
      this.dateofbirth,
      this.document_expiry,
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
      natCode,
    } = (response as { data })?.data || {};

    const gender = sex === '1' ? 'MALE' : 'FEMALE';
    const isNationalityArab = this.registrationFormService.metadata
      .getArabNationalities()
      .includes(this.nationality.value);
    const document_expiry = convertDateStringToNgbDate(idExpiryDateStr);
    const nationality = await this.registrationFormService.metadata
      .getNationalityCodeFromNatCode(natCode)
      .toPromise();
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
      ...( isNationalityArab
        ? [
            { value: firstname_ar, field: this.pf.firstname_ar },
            { value: secondname_ar, field: this.pf.secondname_ar },
            { value: thirdname_ar, field: this.pf.thirdname_ar },
            { value: fourthname_ar, field: this.pf.fourthname_ar },
            { value: lastname_ar, field: this.pf.lastname_ar },
          ]
        : []),
      ...( sex ? [{ value: gender, field: this.pf.gender }] : []),
      { value: idExpiryDateStr ? document_expiry : DIPLOMAT_QID_EXPIRY_DATE, field: this.uf.document_expiry },
      { value: nationality, field: this.uf.nationality },
    ];

    ocr_fields_to_patch
      .filter(({ value, field }) => {
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
      draftId: +this.draftId,
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
      draftId: +this.draftId,
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
      },
    ];

    fields_to_patch.forEach(patchOCRfield);
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
    const {
      user_image: profilePic,
      document_front: passportPic,
    } = this.uploadDocumentForm.getRawValue();
    if (!profilePic || !passportPic) return;
    this.registrationFormService.applicant
      .getPassportOCR({ profilePic, passportPic })
      .pipe(take(1))
      .subscribe(
        (res) => {
          const { status, data } = res ?? {};
          if (status !== 200) {
            this.ocr_error = "Passport image is not valid. Please upload a valid image.";
            return;
          }
          if (data) {
            const isBelow10 = checkPassportDateOfBirthBelowYear(data.dateofBirth, 10);
            const faceMatchScoreValid = parseFloat(data.faceMatchScore) >= MIN_FACE_MATCH_SCORE;
            // const faceMatchScoreConditionallyValid = this.feature === 'package-upload-draft';
            if(isBelow10 || faceMatchScoreValid) {
              this.populatePersonalInfoFromPassport(data);
              this.onPassportNumberBlur();
              this.passport_validated = true;
            } else {
              this.ocr_error = 'Please ensure that the uploaded profile & passport images coincide';
            }
          } else {
            this.ocr_error = 'Something went wrong. Please try again.';
          }
        },
        (err) => {
          console.log('Passport OCR', err);
          this.passport_validated = false;
          this.ocr_error = 'Something went wrong. Please try again.';
        }
      );
  }

  onFaceValidationChange(face_validated: boolean) {
    this.face_validated = face_validated;
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
    if (this.feature === 'manual-upload') {
      this.router.navigate(['../step-3'], {
        relativeTo: this.route,
        state: {
          manualStepOneFormData: {
            eventname: this.eventCode,
            bulkgroupname: this.bulkGroupName,
            organizationname: this.organizationId,
          },
        },
      });
    } else if (this.feature === 'bulk-group-continue') {
      this.router.navigate(['../continue'], {
        relativeTo: this.route,
        queryParams: {
          bulkgroupname: this.bulkGroupName,
        },
      });
    } else if (this.feature === 'BulkGroupstep2') {
      this.router.navigate(['../step-2'], {
        relativeTo: this.route,
        queryParams: {
          bulkGroupName: this.bulkGroupName,
          organizationId: this.organizationId,
        },
      });
    } else if (
      this.feature === 'bulk-upload-non-draft' ||
      this.feature === 'bulk-upload-draft'
    ) {
      this.router.navigate(['../step-2'], {
        relativeTo: this.route,
      });
    } else if (
      this.feature === 'package-upload-non-draft' ||
      this.feature === 'package-upload-draft'
    ) {
      this.router.navigate(['main/bulk-registration/package-upload/step-2']);
    } else if (this.feature === 'package-excel-upload-draft') {
      this.router.navigate(['main/bulk-registration/package-upload/excel-step-2']);
    }
  }

  register() {
    const isVisaTransitOrConferencePrivate = this.b2bVisaType === 'TRANSIT' || this.b2bVisaType === 'CONFERENCE';
    const formValue = [
      this.applicationForm.getRawValue(),
      this.uploadDocumentForm.getRawValue(),
      // this.residencyForm.getRawValue(),
      this.personalInfoForm.getRawValue(),
      ...(isVisaTransitOrConferencePrivate ? [{}] : [this.contactForm.getRawValue()]),
      this.cardChoiceForm.getRawValue(),
      this.termsForm.value,
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

    let applicationInsertBody: CustomerCardApplicationInsertRequest = formValue.reduce(
      (prev, curr) => {
        const formComposed = this.registrationFormService.applicant.composeApplicationInsertRequest(
          curr
        );
        return { ...prev, ...formComposed };
      },
      {}
    );

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

    const RefSystemUser_Id = this.RefSystemUser_Id ?? 3;
    const Channel = 8;

    const [deliverytype, servicecentre, eventname] = [
      'DHC',
      this.serviceCenterCode,
      this.eventCode,
    ];

    const [DocQualityScore, FaceIDScore, BackgroundCheckStatus, BioMatchId] = [
      +this.DocQualityScore,
      this.FaceIDScore,
      0,
      this.BioMatchId,
    ];

    const DocSubType = this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';
    //  1 - for excel upload
    //  2 - bulk registration manual registration
    //  3 - SC registration
    //  9 - package upload
    // 11 - for package excel upload
    let SubmissionType = this.SubmissionType ?? ESubmissionType.MANUAL;
    const excel_features = ['bulk-upload-non-draft', 'bulk-upload-draft', 'package-excel-upload-draft'];
    const package_features = ['package-upload-non-draft', 'package-upload-draft'];
    if (excel_features.includes(this.feature)) {
      // for both excel and package excel, default - package excel
      SubmissionType = SubmissionType === ESubmissionType.MANUAL ? ESubmissionType.PACKAGE_EXCEL : SubmissionType;
    }
    if (package_features.includes(this.feature)) SubmissionType = ESubmissionType.PACKAGE;

    // convert medical array to csv
    let { RefMedicalInformation_Id } = applicationInsertBody;
    RefMedicalInformation_Id =
      ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? '';

    applicationInsertBody = {
      ...applicationInsertBody,
      RefMedicalInformation_Id,
      DateofBirth,
      DocExpiryDate,
      ...(arrivalDate && { arrivalDate }),
      RefSystemUser_Id,
      Channel,
      RefCardDeliveryType_Code: deliverytype,
      RefEvent_Code: eventname,
      RefSerivceCenter_Code: servicecentre,
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
      RefRegServiceCenter_Code:
        this.registrationFormService.menu.getTerminalCode() || null,
      // RefResidentCountry_Code: RefCurrentResidentCountry_Code,
      submitReasonType: 0,
      ApplicationNo: this.applicationNo,
      IsBulkRegistrationDraft: true,
      BulkRegDraftId:
        this.feature === 'bulk-upload-non-draft' ||
        this.feature === 'package-upload-non-draft'
          ? 0
          : +this.draftId,
      BulkGroupName: this.bulkGroupName,
      RefOrganization_Id: this.organizationId,
      // RefRegUserCategory_Code,
      OptInMarketing: true,
      OrgGroupAccommodationAddress: this.OrgGroupAccommodationAddress,
      isProfilePicICAOComplains: this.isProfilePicICAOComplains,
      IcaoAndOcrError: this.icaoAndOcrError
    };

    applicationInsertBody.RefCardDeliveryType_Code = 'DHC';

    if (!arrivalDate) {
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

    if (
      this.feature === 'bulk-upload-non-draft' ||
      this.feature === 'bulk-upload-draft'
    ) {
      applicationInsertBody['MaxNumberOfApplication'] = Number(
        localStorage.getItem('maxBulkApplicationSize')
      );
      applicationInsertBody['bulkGroupExtractId'] = this.extractionId;
      applicationInsertBody['excelRefNumber'] = this.excelRefid;
    }

    const isConferencePublic = this.conferenceType === 'PUBLIC';
    if (isConferencePublic) {
      const accreditationInsertBody = this.getAccreditationInsertBody(this.applicantForm);
      applicationInsertBody = { ...applicationInsertBody, ...accreditationInsertBody };
    }

    this.registrationFormService.applicant
      .addApplicantToBulkDraft(applicationInsertBody, { isAccreditation: isConferencePublic })
      .subscribe(
        (response: any) => {
          console.log({ response });
          this.registrationFormService.spinner.hide('edit-info-submit');
          if (
            this.feature === 'bulk-upload-non-draft' ||
            this.feature === 'bulk-upload-draft'
          ) {
            this.router.navigate(['../step-2'], {
              relativeTo: this.route,
              state: {
                id: this.draftId,
                data: response,
                feature: this.feature,
                uiId: this.customObj['uiId'],
              },
            });
          } else if (
            this.feature === 'package-upload-non-draft' ||
            this.feature === 'package-upload-draft'
          ) {
            this.router.navigate(
              ['main/bulk-registration/package-upload/step-2'],
              {
                state: {
                  id: this.draftId,
                  data: response,
                  feature: this.feature,
                },
              }
            );
          } else if (this.feature === 'package-excel-upload-draft') {
            this.router.navigate(['main/bulk-registration/package-upload/excel-step-2'], {
              state: {
                id: this.draftId,
                data: response,
                feature: this.feature,
              },
            });
          } else {
            this.submit(response?.data?.id);
          }
        },
        (err) => {
          console.log({ err });
          this.registrationFormService.spinner.hide('edit-info-submit');
          this.register_error = err?.error?.message || 'Something went wrong!';
        }
      );
  }

  submit(id: number) {
    const isConferencePublic = this.conferenceType === 'PUBLIC';
    const data = [{ id, isDraft: true }];
    this.processing = true;
    this.processingdata = { totalCount: data.length };
    const body: CreateBulkRegistrationDraftInsertRequestList = {
      data,
      refSystemUser_Id: 3,
      submitReasonType: 1,
      channel: 8,
      bulkGroupName: this.bulkGroupName,
      organizationId: this.organizationId,
    };

    this.registrationFormService.applicant
      .submitBulkregistrationDraft(body, { isAccreditation: isConferencePublic })
      .pipe(
        tap((response) => {
          const { totatlSuccess, failedList } = response;
          if (totatlSuccess !== 1) {
            const message = failedList[0]?.reason;
            throw new Error(message);
          }
        }),
        delay(500 * data.length),
        catchError((err) => throwError(err))
      )
      .subscribe(
        () => {
          this.processing = false;
          this.redirectToList();
        },
        (error) => {
          console.log(error);
          this.processing = false;
          this.register_error =
            error?.error?.message ?? error?.message ?? 'Something went wrong!';
        }
      );
  }

  onRegisterError(event) {
    this.register_error = null;
    event === 'close' || this.redirectToList();
  }

  closedialog(event: any) {
    this.confirm_submit_open = false;
    if (event === 'true') {
      this.register();
    }
  }

  closeMOIError() {
    this.moi_error = false;
  }

  closeQidExistsError() {
    this.qid_exists_error = false;
  }

  validateName(name) {
    const name_regex = /[a-zA-ZÀ-ÿ]/;

    if (name_regex.test(name)) {
      return true;
    } else {
      return false;
    }
  }

  validateArabicName(name) {
    const name_regex = /[\u0600-\u06FF]/;

    if (name_regex.test(name)) {
      return true;
    } else {
      return false;
    }
  }

  onCanUserApplyValid(valid: boolean) {
    this.canUserApplyValid = valid;
  }

  clearDataAFterSwitch(event) {
    const { email, phonecode, mobile } = this.personalInfoForm.getRawValue();
    const { fan_category, conference_name, user_category } = this.applicationForm.getRawValue();
    console.log({ email });
    // this.applicationForm.get('user_category').patchValue(null);
    this.uploadDocumentForm.reset();
    this.personalInfoForm.reset();
    this.contactForm.reset();
    this.cardChoiceForm.reset();
    this.termsForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.cardChoiceForm.get('receive_card').patchValue(false);
    this.fan_category.patchValue(fan_category);
    this.af.conference_name.patchValue(conference_name);
    this.user_category.patchValue(user_category);
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.mobile.patchValue(FORM_PLACEHOLDERS.mobile);
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.user_image_src = null;
    // this.upload_form_submitted = false;
    this.FaceIDScore = 100;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';
    this.qid_validated = false;
    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.passport_validated = false;
    this.face_validated = false;
    this.canUserApplyValid = false;
    this.pf.email.patchValue(email, { emitEvent: false });
    this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
    this.pf.mobile.patchValue(mobile, { emitEvent: false });
  }

  //#region bulk-package-upload-errors
  handlePackageUploadErrors() {
    const draft = getFromLocalStorage({ key: 'bulkPackageOrExcelItem', parse: true });
    const _errors: any[] = draft?.responses ?? [];
    if (_errors?.length) {
      _errors.forEach(err => {
        const { fieldName, message } = err ?? {};
        if (fieldName === 'ProfilePic' && message) this.handlePackageUploadProfilePicError(draft, message, _errors);
        // if (fieldName === 'Email' && message) this.handlePackageUploadEmailError(message);
        if (fieldName === 'ProfilePicOrDocument') this.handlePackageUploadProfilePicOrDocumentError(message, _errors);
        if (fieldName === 'DocumentIdNo') {
          this.uploadFormComponent.passportBlur.emit();
        }
      })
    }
  }

  handlePackageUploadProfilePicError(draft: any, message: string, _errors: any[]) {
    const profileOrDocumentError = _errors.find(x => x?.fieldName === 'ProfilePicOrDocument');
    if (profileOrDocumentError) return;
    const { isProfilePicICAOComplains, docTypeId } = draft.customerCardApplication;
    if (isProfilePicICAOComplains) {
      // face-mismatch
      this.ocr_error = message;
      this.uploadFormComponent.resetDocFront();
      docTypeId === 1 ? this.resetQidFields() : this.resetPassportFields();
    } else {
      // face-invalid
      this.uploadFormComponent.face_validated = false;
      this.uploadFormComponent.face_errors = message?.split(',').map(x => x?.trim());
      this.uploadFormComponent.show_face_error_modal = true;
      this.face_validated = false;
      this.uploadFormComponent.user_image_src = null;
      this.uf.user_image.patchValue(null);
      this.uf.user_image_src.patchValue(null);
    }
  }

  handlePackageUploadEmailError(message: string) {
    if (message === 'E-mail Address is already in use') {
      this.pf.email.setErrors({ notUnique: true });
    }
  }

  handlePackageUploadProfilePicOrDocumentError(message: string, _errors: any[]) {
    const profile_error = _errors.find(x => x?.fieldName === 'ProfilePic');
    const profile_error_message = profile_error?.message ?? '';
    if (!profile_error_message && !message) return;
    let ocr_errors, moi_errors, icao_errors;
    try {
      const message_obj = JSON.parse(message);
      const { OCR, MOI, ICAO } = message_obj ?? {};
      ocr_errors = OCR?.split(',').map(x => x?.trim());
      moi_errors = MOI?.split(',').map(x => x?.trim());
      icao_errors = ICAO?.split(',').map(x => x?.trim());
      profile_error_message && icao_errors.unshift(profile_error_message);
    } catch (error) {
      profile_error_message && (icao_errors = [profile_error_message]);
    }

    // face-invalid
    if (icao_errors?.length) {
      this.uploadFormComponent.face_validated = false;
      this.uploadFormComponent.face_errors = icao_errors;
      this.uploadFormComponent.show_face_error_modal = true;
      this.face_validated = false;
      this.uploadFormComponent.user_image_src = null;
      this.uf.user_image.patchValue(null);
      this.uf.user_image_src.patchValue(null);
      return;
    }
    // qid-invalid
    if (moi_errors?.length) {
      this.ocr_error = moi_errors[0];
      this.uploadFormComponent.resetDocFront();
      this.resetQidFields();
      return;
    }
    // passport-invalid
    if (ocr_errors?.length) {
      this.ocr_error = ocr_errors[0];
      this.uploadFormComponent.resetDocFront();
      this.resetPassportFields();
    }
  }

  handleDraftErrors(data: CustomerCardApplicationGetListResponse) {
    const { isProfilePicICAOMsg, faceIDScore, docTypeId } =  data;
    let ocr_errors, moi_errors, icao_errors;
    try {
      const message_obj = JSON.parse(isProfilePicICAOMsg);
      const { OCR, MOI, ICAO } = message_obj ?? {};
      ocr_errors = OCR?.split(',').map(x => x?.trim());
      moi_errors = MOI?.split(',').map(x => x?.trim());
      icao_errors = ICAO?.split(',').map(x => x?.trim());
    } catch (error) {
      console.log(error);
    }

    // face-invalid
    if (icao_errors?.length) {
      this.uploadFormComponent.face_validated = false;
      this.uploadFormComponent.face_errors = icao_errors;
      this.uploadFormComponent.show_face_error_modal = true;
      this.face_validated = false;
      this.uploadFormComponent.user_image_src = null;
      this.uf.user_image.patchValue(null);
      this.uf.user_image_src.patchValue(null);
      return;
    }
    // qid-invalid
    if (moi_errors?.length) {
      this.ocr_error = moi_errors[0];
      this.uploadFormComponent.resetDocFront();
      this.resetQidFields();
      return;
    }
    // passport-invalid
    if (ocr_errors?.length) {
      this.ocr_error = ocr_errors[0];
      this.uploadFormComponent.resetDocFront();
      this.resetPassportFields();
      return;
    }
    // face-mismatch
    if (docTypeId === 3 && parseFloat(faceIDScore as unknown as string) < MIN_FACE_MATCH_SCORE) {
      // if (this.feature === 'package-upload-draft') return;
      this.ocr_error = 'Please ensure that the uploaded profile & passport images coincide';
      this.uploadFormComponent.resetDocFront();
      this.resetPassportFields();
    }
  }
  //#endregion
}
