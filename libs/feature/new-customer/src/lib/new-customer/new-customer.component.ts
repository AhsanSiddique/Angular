import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  CustomerCardApplicationInsertRequest,
  IValidateEmailPhoneDocumentRequest,
  MetadataResolve,
  MoiEhterazValidationRequest,
  OcrScanPassportResultDto,
  OcrScanQidResultDto,
  TournamentType,
} from "@fan-id/api/server";
import { RegistrationFormService } from "@fan-id/core";
import { UploadDocumentFormComponent, UploadDocumentFormLocalComponent } from "@fan-id/shared/shared-forms";
import { Observable, Subject } from "rxjs";
import { map, take, takeUntil } from "rxjs/operators";
import { convertNgbDateToISO, convertDateStringToNgbDate, convertDateDDMMYYYYToMMDDYYYY, validateDateOfExpiry, DIPLOMAT_QID_EXPIRY_DATE } from "@fan-id/shared/utils/date";
import { FORM_PLACEHOLDERS, ITicketType, onUniqueFieldBlur, patchOCRfield, resetPatchedOCRfield, TICKETTYPE_FANCATEGORY_MAP } from '@fan-id/shared/utils/form';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import * as getCountryISO2 from 'country-iso-3-to-2';

@Component({
  selector: 'fan-id-new-customer',
  templateUrl: './new-customer.component.html',
  styleUrls: ['./new-customer.component.scss'],
})
export class NewCustomerComponent implements OnInit, OnDestroy {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private registrationFormService: RegistrationFormService
  ) {}
  private readonly unsubscribe$ = new Subject<void>();

  translateKey = 'NewCustomer';
  eventName = '';

  @ViewChild(UploadDocumentFormComponent)
  private uploadFormComponent: UploadDocumentFormComponent;

  @ViewChild(UploadDocumentFormLocalComponent)
  private uploadFormLocalComponent: UploadDocumentFormLocalComponent;

  newCustomerForm: FormGroup;
  ticketForm: FormGroup;
  residencyForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  personalInfoForm: FormGroup;
  cardChoiceForm: FormGroup;
  termsForm: FormGroup;

  metadata$: Observable<MetadataResolve>;

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
  qid_exists_error = false;
  register_error: boolean;
  register_success: boolean;
  eventTournamentType: TournamentType = 2;
  isDependent = false;
  formSubmitted = false;
  ocr_fields_patched: AbstractControl[] = [];
  show_confirm_register_modal = false;
  qid_validated = false;

  ngOnInit(): void {
    this.registrationFormService.scroll.scrollToTop();
    this.eventTournamentType = parseInt(localStorage.getItem('eventType')) as TournamentType;
    console.log("dsssss ", localStorage.getItem('eventType'))
    this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.RefParentFanIdNo = this.route.snapshot.queryParamMap.get(
      'parentfanid'
    );
    this.setEventName();

    if(this.eventTournamentType === 2) {
      this.initializeForms();
      this.onApplicationTypeChange();
    } else {
      this.initializeFormsLocal();
    }

    this.setVIPValidations();

    if (this.RefParentFanIdNo) {
      this.isDependent = true;
      this.getParentData();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  setEventName() {
    this.eventName = this.registrationFormService.menu.getSelectedEvent() || '';
  }

  initializeForms() {
    this.newCustomerForm = this.fb.group({
      ticketForm: this.fb.group({
        ticket_type: [null, Validators.required],
        ticket_number: ['', Validators.required],
        ticket_valid: [false, Validators.requiredTrue],
        purpose_visit: [null, Validators.required],
        purpose_visit_other: [''],
      }),

      residencyForm: this.fb.group({
        country_birth: [null],
        country_residence: [null],
        previous_nationality: [null],
        permit_document: [null],
        visa_copy_document: [null],
        job_title: [null],
      }),

      applicationForm: this.fb.group({
        application_type: [null, Validators.required],
        gcc_country: [''],
        fan_category: [null],
        current_country: [null],
        // nationality: [null],
        estimated_arrival: [null],
        user_category: [null],
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

      personalInfoForm: this.fb.group({
        ticket_reference_number: [''],
        order_id: [''],
        voucher_code: [''],
        title: [null],
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
        email: ['', [Validators.required, Validators.email, Validators.maxLength(40)]],
        medical:[[]],
        contactname: ['', [Validators.required, Validators.maxLength(24)]],
        contactnumber: ['', [Validators.required, Validators.maxLength(20)]],
        contactcode: [FORM_PLACEHOLDERS.phonecode, Validators.required],
      }),

      cardChoiceForm: this.fb.group({
        receive_card: [false],
      }),

      termsForm: this.fb.group({
        check: [false, [Validators.requiredTrue]],
        confirm: [false, [Validators.requiredTrue]],
        email_updates: [false]
      }),
    });

    this.ticketForm = this.newCustomerForm.get(
      'ticketForm'
    ) as FormGroup;
    this.residencyForm = this.newCustomerForm.get(
      'residencyForm'
    ) as FormGroup;
    this.applicationForm = this.newCustomerForm.get(
      'applicationForm'
    ) as FormGroup;
    this.uploadDocumentForm = this.newCustomerForm.get(
      'uploadDocumentForm'
    ) as FormGroup;
    this.personalInfoForm = this.newCustomerForm.get(
      'personalInfoForm'
    ) as FormGroup;
    // this.emergencyContactForm = this.newCustomerForm.get(
    //   'emergencyContactForm'
    // ) as FormGroup;
    // this.preferredCollectionForm = this.newCustomerForm.get(
    //   'preferredCollectionPointForm'
    // ) as FormGroup;
    this.cardChoiceForm = this.newCustomerForm.get('cardChoiceForm') as FormGroup;
    this.termsForm = this.newCustomerForm.get('termsForm') as FormGroup;
  }

  initializeFormsLocal(){
    this.newCustomerForm = this.fb.group({
      applicationForm: this.fb.group({
        application_type: ['QRC'],
        // gcc_country: [''],
        fan_category: ["MTH", Validators.required],
        current_country: ['QA'],
        nationality: [null, Validators.required],
      }),

      uploadDocumentForm: this.fb.group({
        user_image: ['', Validators.required],
        user_image_src: ['', Validators.required],
        document_type: ['', Validators.required],
      }),

      personalInfoForm: this.fb.group({
        ticket_reference_number: ['',  Validators.required],
        order_id: [''],
        document_number: ['', Validators.required],
        document_expiry: [null, Validators.required],
        // title: [null, Validators.required],
        firstname: ['', Validators.required],
        // secondname: [{value: '', disabled: true}],
        // thirdname: [{value: '', disabled: true}],
        // fourthname: [{value: '', disabled: true}],
        lastname: ['', Validators.required],
        // firstname_ar: [''],
        // secondname_ar: [''],
        // thirdname_ar: [''],
        // fourthname_ar: [''],
        // lastname_ar: [''],
        gender: [null, Validators.required],
        dateofbirth: ['', Validators.required],
        phonecode: [null, Validators.required],
        mobile: [
          '',
          [
            Validators.required,
            Validators.maxLength(15),
          ],
        ],
        email: ['', [Validators.required, Validators.email,Validators.maxLength(40)]],
        medical: [[110], [Validators.required]],
        issuing_country: [null, Validators.required],
      }),

      termsForm: this.fb.group({
        check: [false, [Validators.requiredTrue]],
        confirm: [false, [Validators.requiredTrue]],
      }),
    });

    this.applicationForm = this.newCustomerForm.get(
      'applicationForm'
    ) as FormGroup;
    this.uploadDocumentForm = this.newCustomerForm.get(
      'uploadDocumentForm'
    ) as FormGroup;
    this.personalInfoForm = this.newCustomerForm.get(
      'personalInfoForm'
    ) as FormGroup;
    // this.emergencyContactForm = this.newCustomerForm.get(
    //   'emergencyContactForm'
    // ) as FormGroup;
    this.termsForm = this.newCustomerForm.get('termsForm') as FormGroup;
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
    this.newCustomerForm.reset();
    if(this.eventTournamentType === 2) {
      this.termsForm.get('email_updates').patchValue(false);
      this.uploadFormComponent.resetDocFront();
      this.uploadFormComponent.resetDocProof();
      this.uploadFormComponent.user_image_src = null;
      this.upload_form_submitted = false;
      this.qid_validated = false;
      this.pf.email.enable();
      this.pf.phonecode.enable();
      this.pf.mobile.enable();
      this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
      this.pf.contactcode.patchValue(FORM_PLACEHOLDERS.phonecode);
      this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    }
    this.FaceIDScore = null;
    this.BioMatchId = null;
    this.DocQualityScore = null;
    if(this.eventTournamentType === 1) {
      this.uploadFormLocalComponent.user_image_src = null;
      this.initializeFormsLocal();
    }
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

  getParentData() {
    this.registrationFormService.applicant
      .getApplicantDetailsByFanId(this.RefParentFanIdNo)
      .pipe(
        take(1),
        map((response: any) => {
          const { data } = response ?? {};
          const { isChildApplication } = data ?? {};
          if (!data || isChildApplication) {
            throw new Error('Invalid Parent FanID');
          }
          return data;
        })
      )
      .subscribe(
        (data: any) => {
          const parentApplicantData = this.registrationFormService.applicant.composeApplicantDetail(
            data
          );
          const { email, mobile, country_code: phonecode } = parentApplicantData;
          this.pf.email.patchValue(email, { emitEvent: false });
          this.pf.mobile.patchValue(mobile, { emitEvent: false });
          this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
        },
        (err) => {
          console.log(err);
          this.parent_error = true;
        }
      );
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

  get uf() {
    return this.uploadDocumentForm.controls;
  }

  get nationality() {
    return this.uf.nationality;
  }

  get document_type() {
    return this.uf.document_type;
  }

  // get PrintedQID(){
  //   return this.uf.PrintedQID;
  // }

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

  // get title() {
  //   return this.pf.title;
  // }

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
      customerCategoryCode: this.af.fan_category.value
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
      const body = {
        type: 'doc',
        documentNo: this.document_type?.value + '-' + value,
        refNationality_Code: this.nationality.value,
        eventcode: localStorage.getItem('eventCode'),
        customerCategoryCode: this.af.fan_category.value
      };
      const service$ = this.registrationFormService.applicant.customerPortalValidateEmailPhoneDocument(
        body
      );
      onUniqueFieldBlur(control, service$, 'notValidDoc');
    }
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

  populatePersonalInfoFromPassport(passportResult: OcrScanPassportResultDto) {
    const {
      classificationScore,
      issuingStateCode,
      dateOfBirth,
      documentNo,
      dateOfExpiry,
      givenNames,
      surname,
      sex,
    } = passportResult;

    const DateOfExpiry = convertDateStringToNgbDate(dateOfExpiry);
    const isDateOfExpiryValid = validateDateOfExpiry(DateOfExpiry);

    if (!isDateOfExpiryValid) {
      this.ocr_error = "Passport should have a minimum validity of 6 months from the start date of the tournament. Please upload a valid document"
      return;
    }

    const DateOfBirth = convertDateStringToNgbDate(dateOfBirth);

    this.DocQualityScore = classificationScore;

    const gender = sex ? sex.toUpperCase() : null;
    const issuing_country = getCountryISO2(issuingStateCode);

    let firstname, secondname, thirdname, fourthname, lastname;
    const name_array = givenNames ? givenNames.split(' ').filter(Boolean) : [];
    const name_array_length = name_array.length;

    switch (name_array_length) {
      case 1:
        [firstname] = name_array;
        break;
      case 2:
        [firstname, secondname] = name_array;
        break;
      case 3:
        [firstname, secondname, thirdname] = name_array;
        break;
      case 4:
        [firstname, secondname, thirdname, fourthname] = name_array;
        break;
      case 5:
      default:
        [firstname, secondname, thirdname, fourthname, lastname] = name_array;
        break;
    }

    lastname = surname || lastname;
    if(!lastname) {
      switch (name_array_length) {
        case 2:
          [firstname, lastname] = name_array;
          secondname = null;
          break;
        case 3:
          [firstname, secondname, lastname] = name_array;
          thirdname = null;
          break;
        case 4:
          [firstname, secondname, thirdname, lastname] = name_array;
          fourthname = null;
          break;
      }
    }
    const fields_to_patch = [
      {
        value: issuing_country,
        field: this.uf.issuing_country,
      },
      {
        value: documentNo,
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
      {
        value: gender,
        field: this.gender,
      },
    ];

    fields_to_patch.forEach(patchOCRfield)
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
      const { ticket_type, ticket_number }: { ticket_type: ITicketType, ticket_number: any} = this.ticketForm.getRawValue();
      const fan_category = ticket_type?.code ?? this.applicationForm.getRawValue()?.fan_category;
      const ticketFormValue = {
        ...(ticket_type?.ticketRequired ? {[ticket_type.ticketField]: ticket_number,} : {}),
        fan_category
      }
      const formValue = [
        this.applicationForm.value,
        this.uploadDocumentForm.getRawValue(),
        this.personalInfoForm.getRawValue(),
        // this.preferredCollectionForm.getRawValue(),
        this.cardChoiceForm.value,
        this.termsForm.value,
        ticketFormValue
      ];

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

      const Channel = 2;
      const eventname = this.registrationFormService.menu.getSelectedEventCode();
      const RefRegServiceCenter_Code = this.registrationFormService.menu.getTerminalCode()

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
      const SubmissionType = 3;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

      const {
        EmergencyContactOneFullName, EmergencyContactOnePhone, EmergencyContactOnePhoneAreaCode,
        FirstName, PhoneAreaCode, Phone
      } = applicationInsertBody;

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
        RefRegServiceCenter_Code,
        EmergencyContactOneFullName: EmergencyContactOneFullName || FirstName,
        EmergencyContactOnePhoneAreaCode: EmergencyContactOnePhoneAreaCode || PhoneAreaCode,
        EmergencyContactOnePhone: EmergencyContactOnePhone || Phone,
        // EmergencyContactTwoFullName,
        // EmergencyContactTwoPhoneAreaCode,
        // EmergencyContactTwoPhone,
        // RefResidentCountry_Code: RefCurrentResidentCountry_Code,
        submitReasonType: 1,
        ...(this.RefParentFanIdNo
          ? {
              RefParentFanIdNo: this.RefParentFanIdNo,
              IsChildApplication: true,
            }
          : { IsChildApplication: false }),
      };

      applicationInsertBody.RefCardDeliveryType_Code = 'DHC';

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

      const Channel = 2;
      const eventname = this.registrationFormService.menu.getSelectedEventCode();
      const RefRegServiceCenter_Code = this.registrationFormService.menu.getTerminalCode();


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
      const SubmissionType = 3;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

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
        Channel,
        RefEvent_Code: eventname,
        DocQualityScore,
        FaceIDScore,
        BackgroundCheckStatus,
        BioMatchId,
        DocSubType,
        SubmissionType,
        RefRegServiceCenter_Code,
        EmergencyContactOneFullName: EmergencyContactOneFullName || FirstName,
        EmergencyContactOnePhoneAreaCode: EmergencyContactOnePhoneAreaCode || PhoneAreaCode,
        EmergencyContactOnePhone: EmergencyContactOnePhone || Phone,
        // EmergencyContactTwoFullName,
        // EmergencyContactTwoPhoneAreaCode,
        // EmergencyContactTwoPhone,
        RefResidentCountry_Code: RefCurrentResidentCountry_Code,
        submitReasonType: 1,
        ...(this.RefParentFanIdNo
          ? {
              RefParentFanIdNo: this.RefParentFanIdNo,
              IsChildApplication: true,
            }
          : { IsChildApplication: false }),
        DocImageFront,
        IsFromDirectReg: true
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

    if(this.eventTournamentType === 2) {
      this.register()
      .then(this.onRegisterSuccess.bind(this))
      .catch(this.onRegisterError.bind(this));
    } else {
      this.registerLocal()
      .then(this.onRegisterSuccess.bind(this))
      .catch(this.onRegisterError.bind(this));
    }
  }

  registerLocal() {
    try {
      const formValue =  [
      this.applicationForm.value,
      this.uploadDocumentForm.value,
      this.personalInfoForm.getRawValue()
    ];

      let applicationInsertBody = this.getApplicationInsertBody(formValue);

      const { RefCurrentResidentCountry_Code } = applicationInsertBody;

      let { DateofBirth, DocExpiryDate } = applicationInsertBody;

      DateofBirth = convertNgbDateToISO(
        (DateofBirth as unknown) as NgbDateStruct
      );
      DocExpiryDate = convertNgbDateToISO(
        (DocExpiryDate as unknown) as NgbDateStruct
      );

      const Channel = 2;

      const eventname = this.registrationFormService.menu.getSelectedEventCode();
      const RefRegServiceCenter_Code = this.registrationFormService.menu.getTerminalCode()

      const DocSubType = this.uploadDocumentForm.get('passportCategory').value ?? 'NORMAL';
      //  1 - for excel upload
      //  2- bulk registration manual registration
      //  3 - SC registration
      const SubmissionType = 3;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>).join()

      applicationInsertBody = {
        ...applicationInsertBody,
        RefMedicalInformation_Id,
        DateofBirth,
        DocExpiryDate,
        Channel,
        RefEvent_Code: eventname,
        DocSubType,
        SubmissionType,
        RefRegServiceCenter_Code,
        RefSerivceCenter_Code: RefRegServiceCenter_Code,
        RefCardDeliveryType_Code: 'DHC',
        RefResidentCountry_Code: RefCurrentResidentCountry_Code,
        submitReasonType: 1,
        IsChildApplication: false,
      };

      return this.registrationFormService.applicant
        .CustomerPortalRegister(applicationInsertBody)
        .pipe(take(1))
        .toPromise();
    } catch (error) {
      console.log(error);
      return Promise.reject({ error: { message: 'Something went wrong!' } });
    }
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

  clearDataAFterSwitch(event) {
    console.log('ApplicationType Changed', event);
    const { email, mobile, phonecode } = this.personalInfoForm.getRawValue();
    this.uploadDocumentForm.reset({onlySelf: true, emitEvent: false});
    this.personalInfoForm.reset();
    this.cardChoiceForm.reset();
    this.termsForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.cardChoiceForm.get('receive_card').patchValue(false);
    this.pf.phonecode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.pf.contactcode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.user_image_src = null;
    this.upload_form_submitted = false;
    this.FaceIDScore = 100;
    this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';

    this.pf.email.enable();
    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.qid_validated = false;

    if(this.isDependent) {
      this.pf.email.patchValue(email, { emitEvent: false });
      this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
      this.pf.mobile.patchValue(mobile, { emitEvent: false });
    }
  }
}
