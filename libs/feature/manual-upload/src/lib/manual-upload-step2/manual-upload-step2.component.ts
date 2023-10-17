import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  CustomerCardApplicationInsertRequest,
  MetadataResolve,
  OcrScanQidResultDto,
  CreateBulkRegistrationDraftInsertRequestList,
  MoiEhterazValidationRequest,
  IRegulaPassportOCR,
  IValidateEmailPhoneDocumentRequest,
} from "@fan-id/api/server";
import { RegistrationFormService } from "@fan-id/core";
import { UploadDocumentFormComponent, ApplicationFormComponent, AccreditationForm } from "@fan-id/shared/shared-forms";
import { Observable, Subject, throwError, timer } from "rxjs";
import { catchError, delay, map, take, tap } from "rxjs/operators";
import { ManualStepOneForm } from "../manual-upload-step1/manual-upload-step1.component";
import { convertNgbDateToISO, convertDateStringToNgbDate, convertDateDDMMYYYYToMMDDYYYY, fromJSDate, checkPassportDateOfBirthBelowYear, DIPLOMAT_QID_EXPIRY_DATE } from "@fan-id/shared/utils/date";
import { patchOCRfield, resetPatchedOCRfield, FORM_PLACEHOLDERS, MIN_FACE_MATCH_SCORE, getPassportOCRCategory, EPassportCategory, onUniqueFieldBlur, INVALID_USER_CATEGORIES_CODE_FOR_QID, getMetadataFilteredByUserCategory, IFormExtras, HayyaCategoryCodeBR, updateFormExtras, getB2BVisaType, getFormExtras, TicketTypes, isCountryGCC, CATEGORIES_WITH_GCC_PERMIT_SC } from '@fan-id/shared/utils/form';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import * as getCountryISO2 from 'country-iso-3-to-2';
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: 'fan-id-manual-upload-step2',
  templateUrl: './manual-upload-step2.component.html',
  styleUrls: ['./manual-upload-step2.component.scss'],
})
export class ManualUploadStep2Component extends AccreditationForm implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private registrationFormService: RegistrationFormService,
    private sanitizer: DomSanitizer
  ) {
    super();
    this.stepOneFormData = this.router.getCurrentNavigation()?.extras?.state?.manualStepOneFormData;
  }

  private readonly unsubscribe$ = new Subject<void>();

  translateKey = 'ManualStep2';
  stepOneFormData: ManualStepOneForm;
  eventName = '';
  displayEventName = '';

  @ViewChild(UploadDocumentFormComponent)
  private uploadFormComponent: UploadDocumentFormComponent;

  @ViewChild(ApplicationFormComponent)
  private applicationFormComponent: ApplicationFormComponent;

  registrationForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  residencyForm: FormGroup;
  personalInfoForm: FormGroup;
  cardChoiceForm: FormGroup;
  termsForm: FormGroup;
  contactForm: FormGroup;

  metadata$: Observable<MetadataResolve>;
  _metadata$: Observable<MetadataResolve>;

  is_uploading = false;
  upload_form_submitted = false;

  applicants: any[] = [null];
  currentApplicantFormValue: any;
  currentApplicantName: string;
  currentApplicantId = 1;
  selectedApplicantId = 1;

  show_cancel_modal = false;
  register_error = false;
  register_error_message = '';

  FaceIDScore: number;
  BioMatchId: string;
  DocQualityScore: string;
  ocr_error: string;

  show_delete_modal = false;

  processing = false;
  processingdata: any;
  submittedStatus = false;
  subStatus: any;
  submittedError = null;
  failedList = [];
  save_success = false;
  draft_list_error = null;
  ocr_fields_patched: AbstractControl[] = [];

  moi_error: boolean;
  show_confirm_register_modal = false;
  confirm_save_popup = false;
  qid_validated = false;
  passport_validated = false;
  face_validated = false;

  draftId = '';
  qid_exists_error: boolean;
  canUserApplyValid = false;
  ngOnInit() {
    if (!this.stepOneFormData) {
      this.redirectToStepOne();
      return;
    }
    console.log(this.stepOneFormData);
    this._metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.metadata$ = getMetadataFilteredByUserCategory({ metadata$: this._metadata$ });
    this.setEventName();
    this.initializeForms();
    this.initializeAccreditationForm(this.registrationForm);
    this.registrationFormService.scroll.scrollToTop();
    this.setInitialFormValues();
  }

  initializeForms() {
    this.registrationForm = this.fb.group({
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
        user_image_src: ['', Validators.required],
        document_type: ['', Validators.required],
        document_front: [''],
        document_front_src: [''],
        document_proof: [''],
        document_proof_src: [''],
        PrintedQID: [''],
        document_number: ['', Validators.required],
        document_expiry: [null, Validators.required],
        dateofbirth: ['', Validators.required],
        issuing_country: [null, Validators.required],
        passportCategory: [null, Validators.required],
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

    this.applicationForm = this.registrationForm.get('applicationForm') as FormGroup;
    this.uploadDocumentForm = this.registrationForm.get('uploadDocumentForm') as FormGroup;
    this.residencyForm = this.registrationForm.get('residencyForm') as FormGroup;
    this.personalInfoForm = this.registrationForm.get('personalInfoForm') as FormGroup;
    this.cardChoiceForm = this.registrationForm.get('cardChoiceForm') as FormGroup;
    this.termsForm = this.registrationForm.get('termsForm') as FormGroup;
    this.contactForm = this.registrationForm.get('contactForm') as FormGroup;
  }

  setInitialFormValues() {
    timer(10).subscribe({
      next: () => {
        // this.application_type.setValue('Other');
        this.setInitialApplicationFormValue();
        this.setInitialContactFormValue();
      }
    })
  }

  setInitialApplicationFormValue() {
    const { hayyaVisitCategory, conferenceId } = this.stepOneFormData;
    this.application_type.setValue('Other');
    hayyaVisitCategory && this.fan_category.setValue(hayyaVisitCategory);
    conferenceId && this.af.conference_name.setValue(conferenceId);
    // this.af.user_category.setValue(user_category);
    this.fan_category.disable();
    this.af.conference_name.disable();
    // this.af.user_category.disable();
  };

  setInitialContactFormValue() {
    const { phoneAreaCode, phoneNumber } = this.stepOneFormData?.organization ?? {};
    this.contactForm.get('phonecode').setValue(FORM_PLACEHOLDERS.phonecode);
    this.contactForm.get('emergencyPhoneCode').setValue(phoneAreaCode);
    this.contactForm.get('emergencyPhoneNumber').setValue(phoneNumber);
    this.contactForm.get('emergencyPhoneCode').disable();
    this.contactForm.get('emergencyPhoneNumber').disable();
  }

  get b2bVisaType() {
    return getFormExtras(this.registrationForm)?.b2bVisaType;
  }

  get conferenceType() {
    if (this.b2bVisaType !== 'CONFERENCE') return null;
    return getFormExtras(this.registrationForm)?.conferenceType;
  }

  //#region form value set methods
  getApplicantFormValue(applicantData) {
    const {
      id,
      faceIDScore,
      docQualityScore,
      bioMatchId,
      system_RowVersion,
      applicationTypeCode: application_type,
      customerCategoryCode: fan_category,
      // currentResidentCountryCode: current_country,
      nationalityCode: nationality,
      applicationNo,
      arrivalDate,
      userCategoryCode: user_category,
      userId: RefSystemUser_Id,
      icaoAndOcrError,
      isProfilePicICAOComplains,
      refPurposeOfVisit_Code: purpose_visit,
      purposeOfVisit: purpose_visit_other,
      refConferenceEvent_Id: conference_name,
      refCustomerComapanyProfileIds: conference_profile,
    } = applicantData;

    const _arrivalDate = new Date(arrivalDate);
    const estimated_arrival = arrivalDate && fromJSDate(_arrivalDate);

    const applicationFormValue = {
      application_type,
      // gcc_country: current_country,
      fan_category,
      // current_country,
      // nationality,
      estimated_arrival,
      user_category,
      purpose_visit,
      purpose_visit_other,
      conference_name,
      conference_profile
    };

    const {
      profilePic,
      docTypeId: document_type,
      docImageFront,
      accommodationPic,
      dateofBirth,
      docExpiryDate,
      documentIdNo: document_number,
      DocIssuingAuthority: issuing_country,
      docSubType: passportCategory,
    } = applicantData;

    const dateOB = new Date(dateofBirth);
    const dob = {
      year: dateOB.getFullYear(),
      month: dateOB.getMonth() + 1,
      day: dateOB.getDate(),
    };
    const docEx = new Date(docExpiryDate);
    const doce = {
      year: docEx.getFullYear(),
      month: docEx.getMonth() + 1,
      day: docEx.getDate(),
    };

    const uploadDocumentFormValue = {
      document_front: '',
      user_image: '',
      document_type,
      docImageFront,
      profilePic,
      accommodationPic,
      document_number,
      dateofbirth: {
        ...dob,
      },
      document_expiry: {
        ...doce,
      },
      issuing_country,
      passportCategory,
      nationality,
    };

    const {
      placeOfBirth: country_birth,
      previousNationality_Code: previous_nationality,
      currentResidentCountryCode: country_residence,
      visaCopyDoc: visa_copy_document,
      gccDoc: permit_document,
      professionCode: job_title,
      otherProfession: job_title_other,
      accommodationTypeSelected: accommodation_type,
      hotelAccommodationAddress: accommodation_name,
    } = applicantData;

    const residencyFormValue = {
      country_birth,
      has_previous_nationality: previous_nationality ? 'YES' : 'NO',
      previous_nationality,
      country_residence,
      job_title,
      job_title_other,
      permit_document,
      visa_copy_document,
    }

    const {
      ticketNo: ticket_reference_number,
      ticketOrderId: order_id,
      voucherCode: voucher_code,
      titleCode: title,
      firstName: firstname,
      secondName: secondname,
      thirdName: thirdname,
      fourthName: fourthname,
      lastName: lastname,
      firstArabicName: firstname_ar,
      secondArabicName: secondname_ar,
      thirdArabicName: thirdname_ar,
      forthArabicName: fourthname_ar,
      fifthArabicName: lastname_ar,
      genderCode: gender,
      phoneAreaCode: phonecode,
      phone: mobile,
      email: email,
      // medicalInformationId: medical,
      optInMarketing: email_updates,
      isHayyaCard: receive_card,
    } = applicantData;

    const personalInfoFormValue = {
      ticket_reference_number,
      order_id,
      voucher_code,
      title,
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
      // user_category: null
    };

    const contactFormValue = { phonecode, mobile };

    const termsFormValue = { check: true, confirm: true, email_updates };
    const cardChoiceFormValue = { receive_card };

    const accreditationFormValue = this.getAccreditationFormValueFromApplicantData(applicantData);

    return {
      data: {
        id,
        docQualityScore,
        faceIDScore,
        bioMatchId,
        applicationNo,
        system_RowVersion,
        RefSystemUser_Id,
        icaoAndOcrError,
        isProfilePicICAOComplains
      },
      name: firstname,
      formValue: [
        applicationFormValue,
        uploadDocumentFormValue,
        personalInfoFormValue,
        contactFormValue,
        cardChoiceFormValue,
        termsFormValue,
        residencyFormValue,
        accreditationFormValue
      ],
    };
  }

  async setUploadDocumentFormValue(data: any) {
    const [, uploadDocumentFormValue] = this.currentApplicantFormValue;
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
    });

    if(passportCategory === EPassportCategory.TRAVELDOCUMENT) this.uf.passportCategory.disable();
    this.registrationFormService.spinner.show('upload-info-image');
    const userImageUrl = this.registrationFormService.applicant.composeImageUrl(
      profilePic,
      false,
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
          uploadDocumentFormValue.user_image_src = reader.result as string;
          uploadDocumentFormValue.user_image = imageBlob;
          delete uploadDocumentFormValue.user_image_url;
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
          uploadDocumentFormValue.document_front_src = reader.result as string;
          uploadDocumentFormValue.document_front = imageBlob;
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

  //#endregion form value set methods

  redirectToStepOne() {
    this.router.navigate(['../step-1'], { relativeTo: this.route });
  }

  redirectToDashboard() {
    this.router.navigate(['main', 'dashboard']);
  }

  redirectToBulkGroups() {
    this.router.navigate(['main', 'bulk-groups', 'step-1']);
  }

  setEventName() {
    this.eventName = this.registrationFormService.menu.getSelectedEvent();
    this.displayEventName = localStorage.getItem('displayEvent');
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

  get nationality() {
    return this.uf.nationality;
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

  get documentInformationSectionValid() {
    return this.uploadDocumentForm.valid &&
      (this.pf.email.disabled ? true : this.pf.email.valid) &&
      this.face_validated &&
      this.passport_validated &&
      this.canUserApplyValid;
  }
  //#endregion uploadDocumentForm getters

  onVisible(formGroup: FormGroup) {
    formGroup.markAllAsTouched();
  }

  //#region header action methods
  clearData() {
    this.registrationForm.reset();
    this.setInitialFormValues();
    updateFormExtras(this.registrationForm, { manualUpload: true });
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
    this.qid_validated = false;
    this.passport_validated = false;
    this.face_validated = false;

    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
    this.uf.passportCategory.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.draftId = '';
    this.canUserApplyValid = false;
  }

  deleteApplicant(confirm = false) {
    this.show_delete_modal = confirm;
    if (confirm) return;
    console.log('delete applicant');
    const applicantData = this.applicants.find(
      (applicant) => applicant?.id === this.selectedApplicantId
    );

    if (applicantData && applicantData.data) {
      const { data } = applicantData;
      const { id, system_RowVersion } = data;
      this.registrationFormService.applicant
        .deleteApplicantFromBulkDraft({ id, system_RowVersion })
        .pipe(take(1))
        .subscribe(
          (response) => {
            console.log({ response });
            this.applicants = [
              ...this.applicants
                .filter((applicant) => applicant?.id !== applicantData.id)
                .map((applicant, index) => {
                  if (!applicant) return null;
                  applicant.id = index + 1;
                  return applicant;
                }),
            ];

            this.currentApplicantId =
              this.currentApplicantId !== 1 ? --this.currentApplicantId : 1;
            this.selectedApplicantId = this.currentApplicantId;
            this.clearData();
            if (this.selectedApplicant) {
              this.onApplicantSelect(this.selectedApplicantId);
            }
          },
          (error) => {
            console.log('delete applicant', { error });
          }
        );
    }
  }

  saveData() {
    this.confirm_save_popup = true;
  }

  saveandExit() {
    this.confirm_save_popup = false;
    this.submitForm({ save: true });
  }
  //#endregion header action methods

  //#region ocr methods
  async uploadDocument() {
    const { document_type } = this.uploadDocumentForm.getRawValue();
    if (document_type === 3) {
      this.upload_form_submitted = true;
    } else {
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
    if (this.ocr_error !== 'error') {
      this.upload_form_submitted = false;
    }
    this.ocr_error = null;
  }
  //#endregion ocr methods

  getApplicationInsertBody() {
    const isVisaTransitOrConferencePrivate = this.b2bVisaType === 'TRANSIT' || this.conferenceType === 'PRIVATE';
    const formValue = [
      this.applicationForm.getRawValue(),
      this.uploadDocumentForm.getRawValue(),
      // this.residencyForm.getRawValue(),
      this.personalInfoForm.getRawValue(),
      ...(isVisaTransitOrConferencePrivate ? [{}] : [this.contactForm.getRawValue()]),
      this.cardChoiceForm.value,
      this.termsForm.value,
    ];

    this.currentApplicantFormValue = [
      ...formValue,
      this.residencyForm.getRawValue(),
      this.accreditationForm.getRawValue()
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

    const { FirstName } = applicationInsertBody;
    this.currentApplicantName = FirstName;

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

    const {
      deliverytype,
      servicecentre,
      bulkgroupname,
      organizationname,
      eventname,
      OrgGroupAccommodationAddress
      // numberofapplication
    } = this.stepOneFormData;

    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.FaceIDScore = 100;
    this.DocQualityScore = '100';
    const [DocQualityScore, FaceIDScore, BackgroundCheckStatus, BioMatchId] = [
      +this.DocQualityScore,
      this.FaceIDScore,
      0,
      this.BioMatchId,
    ];

    const DocSubType =
      this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';
    //  1 - for excel upload
    //  2- bulk registration manual registration
    //  3 - SC registration
    const SubmissionType = 2;

    // convert medical array to csv
    let { RefMedicalInformation_Id } = applicationInsertBody;
    RefMedicalInformation_Id =
      ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? '';

    const {
      phoneAreaCode: EmergencyContactOnePhoneAreaCode,
      name: orgName,
      contactName,
      phoneNumber: EmergencyContactOnePhone,
    } = this.stepOneFormData.organization;

    let EmergencyContactOneFullName = contactName ?? orgName;
    // remove special characters, spaces, and digits. 20 char limit
    EmergencyContactOneFullName = EmergencyContactOneFullName.replace(
      /[^a-zA-Z]/g,
      ' '
    )
      .trim()
      .split(' ')[0]
      .slice(0, 20);

    applicationInsertBody = {
      ...applicationInsertBody,
      RefMedicalInformation_Id,
      DateofBirth,
      DocExpiryDate,
      ...(arrivalDate && { arrivalDate }),
      Channel,
      RefCardDeliveryType_Code: deliverytype,
      RefEvent_Code: eventname,
      RefOrganization_Id: +organizationname,
      BulkGroupName: bulkgroupname,
      RefSerivceCenter_Code: servicecentre,
      DocQualityScore,
      FaceIDScore,
      BackgroundCheckStatus,
      BioMatchId,
      DocSubType,
      SubmissionType,
      IsChildApplication: false,
      // DocImageBack: DocImageFront,
      // RefResidentCountry_Code: RefCurrentResidentCountry_Code,
      IsBulkRegistrationDraft: true,
      submitReasonType: 0,
      // MaxNumberOfApplication: +numberofapplication,
      EmergencyContactOnePhoneAreaCode,
      EmergencyContactOneFullName,
      EmergencyContactOnePhone,
      OptInMarketing: true,
      OrgGroupAccommodationAddress,
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

    // Draft = 0,
    // Submit = 1,
    // Resubmit = 2,
    // RequestForCorrection = 3,
    // Lost_Stolen=4,
    // Card_Malfunctioning=5

    return applicationInsertBody;
  }

  async submitForm({
    addApplicant,
    save,
  }: { addApplicant?: boolean; save?: boolean } = {}) {
    this.registrationFormService.spinner.show('add-save-applicant');
    const isConferencePublic = this.conferenceType === 'PUBLIC';
    let applicationInsertBody = this.getApplicationInsertBody();
    if (isConferencePublic) {
      const accreditationInsertBody = this.getAccreditationInsertBody(this.registrationForm);
      applicationInsertBody = { ...applicationInsertBody, ...accreditationInsertBody };
    }

    // check if applicant is new
    const applicantData = this.applicants.find(
      (applicant) => applicant?.id === this.selectedApplicantId
    );
    let BulkRegDraftId = null;

    if (applicantData) {
      const { data } = applicantData;
      const {
        id,
        docQualityScore,
        faceIDScore,
        bioMatchId,
        applicationNo,
        RefSystemUser_Id,
        icaoAndOcrError,
        isProfilePicICAOComplains
      } = data ?? { id: null };
      if (id) {
        BulkRegDraftId = id;
        applicationInsertBody.BulkRegDraftId = id;
        applicationInsertBody.DocQualityScore = docQualityScore;
        applicationInsertBody.FaceIDScore = faceIDScore;
        applicationInsertBody.BioMatchId = bioMatchId;
        applicationInsertBody.ApplicationNo = applicationNo;
        applicationInsertBody.RefSystemUser_Id = RefSystemUser_Id;
        applicationInsertBody.IcaoAndOcrError = icaoAndOcrError;
        applicationInsertBody.isProfilePicICAOComplains = isProfilePicICAOComplains;
      }
    }

    this.registrationFormService.applicant
      .addApplicantToBulkDraft(applicationInsertBody, { isAccreditation: isConferencePublic })
      .subscribe(
        (response: any) => {
          // console.log({ response });
          const { id: _id } = response?.data ?? {};
          if (save) {
            this.registrationFormService.spinner.hide('add-save-applicant');
            this.save_success = true;
            return;
          }

          if (addApplicant) {
            this.clearData();
            const {
              docQualityScore,
              faceIDScore,
              bioMatchId,
              applicationNo,
              system_RowVersion,
              userId: RefSystemUser_Id,
              icaoAndOcrError,
              isProfilePicICAOComplains
            } = response?.data ?? {};
            let data = null;
            if (_id) {
              data = {
                id: _id,
                docQualityScore,
                faceIDScore,
                bioMatchId,
                applicationNo,
                system_RowVersion,
                RefSystemUser_Id,
                icaoAndOcrError,
                isProfilePicICAOComplains
              };
            }
            if (BulkRegDraftId) {
              this.addCurrentApplicantToList(data, true);
            } else {
              this.addCurrentApplicantToList(data);
            }
            this.registrationFormService.scroll.scrollToTop();
            this.registrationFormService.spinner.hide('add-save-applicant');
            return;
          }

          this.addCurrentApplicantToList({ id: _id }, !!applicantData);
          this.registrationFormService.spinner.hide('add-save-applicant');
          this.onSubmit();
        },
        (err) => {
          console.log({ err });
          this.registrationFormService.spinner.hide('add-save-applicant');
          this.register_error = true;
          this.register_error_message =
            err?.error?.message || 'Something went wrong!';
        }
      );
  }

  onSubmit() {
    const isConferencePublic = this.conferenceType === 'PUBLIC';
    const data = this.applicants
      .filter((applicant) => !!applicant?.data?.id)
      .map((applicant) => ({ id: applicant?.data?.id, isDraft: true }));
    this.processing = true;
    this.processingdata = { totalCount: data.length };
    const body: CreateBulkRegistrationDraftInsertRequestList = {
      data,
      refSystemUser_Id: 3,
      submitReasonType: 1,
      channel: 8,
      bulkGroupName: this.stepOneFormData.bulkgroupname,
      organizationId: +this.stepOneFormData.organizationname,
    };

    this.registrationFormService.applicant
      .submitBulkregistrationDraft(body, { isAccreditation: isConferencePublic })
      .pipe(
        tap((response) => {
          const { totatlFailed, totatlSuccess, failedList } = response;
          this.subStatus = {
            succesRecords: totatlSuccess,
            failedRecords: totatlFailed,
          };
          this.failedList = failedList.map((item) => item?.data);
        }),
        delay(500 * data.length),
        catchError((err) => throwError(err))
      )
      .subscribe(
        () => {
          this.processing = false;
          this.submittedStatus = true;
        },
        (error) => {
          console.error(error);
          this.processing = false;
          this.submittedError =
            error?.error?.message || 'Something went wrong!';
        }
      );
  }

  AddApplicant() {
    this.submitForm({ addApplicant: true });
  }

  get selectedApplicant() {
    return this.applicants.find(
      (applicant) => applicant?.id === this.selectedApplicantId
    );
  }

  get applicantsLength() {
    return this.applicants.length;
  }

  addCurrentApplicantToList(
    applicantDataFromDraft = null,
    isApplicationEdit = false
  ) {
    const id = isApplicationEdit
      ? this.selectedApplicantId
      : this.applicants.length;

    const filterFn = isApplicationEdit
      ? (applicant) => applicant && applicant?.id !== id
      : (applicant) => applicant && !applicant?.saved;

    this.applicants = [
      ...this.applicants.filter(filterFn),
      {
        id,
        formValue: this.currentApplicantFormValue,
        name: this.currentApplicantName,
        data: applicantDataFromDraft,
      },
      null, // dummy for new applicant
    ];
    this.applicants.sort((a, b) => a?.id - b?.id);
    this.currentApplicantId++;
    this.selectedApplicantId = this.currentApplicantId;

    if (this.selectedApplicant) {
      this.applicants = [...this.applicants.filter(Boolean)];
      this.onApplicantSelect(this.selectedApplicantId);
    }
  }

  async onApplicantSelect(applicantId) {
    const applicantData = this.applicants.find(
      (applicant) => applicant?.id === applicantId
    );
    const currentApplicantData = this.applicants.find(
      (applicant) => applicant?.id === this.currentApplicantId
    );
    if (
      (!currentApplicantData && this.registrationForm.touched) ||
      (currentApplicantData && currentApplicantData.saved)
    ) {
      this.saveCurrentApplicantFormValue();
    }
    this.clearData();
    this.registrationFormService.scroll.scrollToTop();
    this.currentApplicantId = this.selectedApplicantId = applicantId;
    if (applicantData) {
      const {
        formValue,
        continue: _continue,
        name,
        bulk_group_continue,
        saved,
        formData,
        data
      } = applicantData;
      this.currentApplicantName = name;
      this.currentApplicantFormValue = formValue;
      const [
        applicationFormValue,
        uploadDocumentFormValue,
        personalInfoFormValue,
        contactFormValue,
        cardChoiceFormValue,
        termsFormValue,
        residencyFormValue,
        accreditationFormValue
      ] = formValue;

      this.applicationForm.patchValue(applicationFormValue);
      this.accreditationForm.patchValue(accreditationFormValue);
      this.uploadFormComponent.initialDocumentNumber = uploadDocumentFormValue.document_number;
      this.uploadFormComponent.initialNationality = uploadDocumentFormValue.nationality;
      if (_continue) {
        await this.setUploadDocumentFormValue(uploadDocumentFormValue);
        await this.setResidencyFormValue(residencyFormValue);
        applicantData.continue = false;
      } else {
        this.uploadDocumentForm.patchValue(uploadDocumentFormValue);
        this.uploadFormComponent.user_image_src = uploadDocumentFormValue.user_image_src;
        if (this.uf.passportCategory.value === EPassportCategory.TRAVELDOCUMENT) this.uf.passportCategory.disable();
        this.residencyForm.patchValue(residencyFormValue);
      }

      if (saved) {
        this.upload_form_submitted = formData.upload_form_submitted;
        this.uploadFormComponent.doc_front_selected =
          formData.doc_front_selected;
        formData.doc_front_selected &&
          (this.uploadFormComponent.doc_front_name = 'doc_front.jpg');
        this.uploadFormComponent.doc_proof_selected =
          formData.doc_proof_selected;
        formData.doc_proof_selected &&
          (this.uploadFormComponent.doc_proof_name =
            'proof_of_accommodation.jpg');
        if (this.upload_form_submitted) {
          this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
          this.FaceIDScore = 100;
          this.DocQualityScore = '100';
        }
        this.qid_validated = formData.qid_validated;
        this.passport_validated = formData.passport_validated;
        this.face_validated = formData.face_validated;
        this.canUserApplyValid = formData.canUserApplyValid;
        this.uploadFormComponent.canUserApply$.next(!this.canUserApplyValid);
        this.personalInfoForm.patchValue(personalInfoFormValue);
        this.cardChoiceForm.patchValue(cardChoiceFormValue);
        this.termsForm.patchValue(termsFormValue);
      } else {
        this.upload_form_submitted = true;
        this.uploadFormComponent.doc_front_selected = true;
        this.uploadFormComponent.doc_front_name = 'doc_front.jpg';
        this.qid_validated = uploadDocumentFormValue?.document_type === 1;
        this.passport_validated = uploadDocumentFormValue?.document_type === 3;
        this.face_validated = true;
        this.canUserApplyValid = true;
        this.uploadFormComponent.canUserApply$.next(false);

        if (uploadDocumentFormValue.doc_proof_src) {
          this.uploadFormComponent.doc_proof_selected = true;
          this.uploadFormComponent.doc_proof_name =
            'proof_of_accommodation.jpg';
        }

        this.personalInfoForm.patchValue(personalInfoFormValue);
        this.contactForm.patchValue(contactFormValue);
        this.draftId = data?.id;

        if (!bulk_group_continue) {
          this.pf.phonecode.disable();
          this.pf.mobile.disable();
          this.pf.email.disable();
        }

        this.cardChoiceForm.patchValue(cardChoiceFormValue);
        this.termsForm.patchValue(termsFormValue);
      }

      if(this.qid_validated) {
        this.ocr_fields_patched = [
          this.firstname,
          this.pf.secondname,
          this.pf.thirdname,
          this.pf.fourthname,
          this.pf.lastname,
          this.gender
        ]
      }
    }
  }

  saveCurrentApplicantFormValue() {
    const id = this.applicants.length;
    const currentApplicantData = this.applicants.find(
      (applicant) => applicant?.id === this.currentApplicantId
    );

    const formValue = [
      this.applicationForm.getRawValue(),
      this.uploadDocumentForm.getRawValue(),
      this.personalInfoForm.getRawValue(),
      this.contactForm.getRawValue(),
      this.cardChoiceForm.value,
      this.termsForm.value,
      this.residencyForm.getRawValue(),
      this.accreditationForm.getRawValue(),
    ];
    const name = this.personalInfoForm.getRawValue().firstname ?? '';
    this.applicants = [
      ...this.applicants.filter((applicant) => applicant && !applicant?.saved),
      {
        id: currentApplicantData?.save ? currentApplicantData.id : id,
        formValue,
        name,
        saved: true,
        formData: {
          // steps: JSON.parse(JSON.stringify(this.stepper.steps)),
          upload_form_submitted: this.upload_form_submitted,
          doc_front_selected: this.uploadFormComponent.doc_front_selected,
          doc_proof_selected: this.uploadFormComponent.doc_proof_selected,
          qid_validated: this.qid_validated,
          passport_validated: this.passport_validated,
          face_validated: this.face_validated,
          canUserApplyValid: this.canUserApplyValid,
        },
      },
    ];
  }

  next() {
    const applicantId = this.selectedApplicantId + 1;
    this.onApplicantSelect(applicantId);
  }

  previous() {
    const applicantId = this.selectedApplicantId - 1;
    this.onApplicantSelect(applicantId);
  }

  cancel() {
    this.router.navigate(['/main/bulk-registration']);
  }

  onRegisterError(event: any) {
    this.register_error = false;
    this.register_error_message = '';
    event === 'close' || this.redirectToDashboard();
  }

  closeSubmissionStatus(event) {
    if (event === 'close') {
      this.redirectToBulkGroups();
    } else if (event === 'show-failed-records') {
      this.viewFailedRecords();
    }
  }

  closeSubmitError() {
    this.submittedError = false;
  }

  closeSaveSuccess() {
    this.redirectToBulkGroups();
  }

  viewFailedRecords() {
    this.router.navigate(['../failed-records'], {
      relativeTo: this.route,
      state: {
        manualStepOneFormData: {
          ...this.stepOneFormData,
          failedList: this.failedList,
        },
      },
    });
  }

  closeDraftListError() {
    this.redirectToDashboard();
  }

  closeMOIError() {
    this.moi_error = false;
  }

  closeQidExistsError() {
    this.qid_exists_error = false;
  }

  onConfirmRegisterModal(action: 'proceed' | 'close') {
    this.show_confirm_register_modal = false;
    if (action === 'proceed') {
      this.submitForm();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onCanUserApplyValid(valid: boolean) {
    this.canUserApplyValid = valid;
  }

  clearDataAFterSwitch(event) {
    // this.applicationForm.get('user_category').patchValue(null, { emitEvent: false });
    this.uploadDocumentForm.reset();
    this.personalInfoForm.reset();
    this.contactForm.reset();
    this.cardChoiceForm.reset();
    this.termsForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.cardChoiceForm.get('receive_card').patchValue(false);
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.mobile.patchValue(FORM_PLACEHOLDERS.mobile);
    this.setInitialContactFormValue();
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.user_image_src = null;
    this.upload_form_submitted = false;
    this.FaceIDScore = 100;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';

    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.qid_validated = false;
    this.passport_validated = false;
    this.face_validated = false;
    this.canUserApplyValid = false;

    if (event === 'QRC') {
      this.metadata$ = getMetadataFilteredByUserCategory({
        metadata$: this.metadata$,
        userCategoryCodes: INVALID_USER_CATEGORIES_CODE_FOR_QID,
        filter_out: true
      });
    } else {
      this.metadata$ = getMetadataFilteredByUserCategory({ metadata$: this._metadata$ });
    }
  }
}
