import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  MetadataResolve,
  ApplicantDetailResolved,
  ApplicantService,
  CustomerCardApplicationInsertRequest,
  OcrScanQidResultDto,
  OcrScanPassportResultDto,
  fanidCategoryFilterFn,
} from "@fan-id/api/server";
import { UploadDocumentFormComponent } from "@fan-id/shared/shared-forms";
import { Environment, FanIDConfig, MenuService, ScrollService } from "@fan-id/core";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
import { convertNgbDateToISO, convertDateStringToNgbDate, convertDateDDMMYYYYToMMDDYYYY, fromJSDate } from "@fan-id/shared/utils/date";
import { FORM_PLACEHOLDERS, patchOCRfield, personalInfoValidators } from '@fan-id/shared/utils/form';
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import * as getCountryISO2 from 'country-iso-3-to-2';
import { NgxSpinnerService } from "ngx-spinner";


@Component({
  selector: "fan-id-edit-card-applicant-details",
  templateUrl: "./edit-card-applicant-details.component.html",
  styleUrls: ["./edit-card-applicant-details.component.scss"],
})
export class EditCardApplicantDetailsComponent  implements OnInit {
  translateKey = 'EditApplication';
  show_cancel_modal = false;

  applicantForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  personalInfoForm: FormGroup;
  deliveryInfoForm: FormGroup;
  termsForm: FormGroup;
  emergencyContactForm: FormGroup;
  preferredCollectionForm: FormGroup;

  @ViewChild(UploadDocumentFormComponent, { static: true })
  private uploadFormComponent!: UploadDocumentFormComponent;

  metadata$: Observable<MetadataResolve>;

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

  ocr_error: string;
  serviceCenterCode: string;
  registrationServiceCenterCode: string;
  isServiceCenter = false;
  constructor(
    private fb: FormBuilder,
    private applicantService: ApplicantService,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(FanIDConfig) private appconfig: Environment,
    private sanitizer: DomSanitizer,
    private scrollService: ScrollService,
    private menuService: MenuService,
    private spinner: NgxSpinnerService
  ) {
    this.isServiceCenter = this.appconfig.application === 'ServiceCenter';
  }

  ngOnInit(): void {
    this.fanId = this.route.snapshot.queryParamMap.get('fanid');
    this.submitReasonType = this.route.snapshot.queryParamMap.get('submitReasonType');
    if(!this.submitReasonType) {
      this.redirectToList();
    }
    this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.initializeForms();
    this.setApplicantFormValue();
    this.scrollService.scrollToTop();
  }

  initializeForms() {
    this.applicantForm = this.fb.group({
      applicationForm: this.fb.group({
        application_type: [null],
        gcc_country: [''],
        fan_category: [null, Validators.required],
        current_country: [null, Validators.required],
        nationality: [null, Validators.required],
        estimated_arrival: [null],
        user_category: [null],
      }),

      uploadDocumentForm: this.fb.group({
        user_image: [''],
        user_image_url: [''],
        user_image_src: [''],
        document_type: ['', Validators.required],
        document_front: [''],
        document_front_src: [''],
        document_proof: [''],
        document_proof_src: ['']
      }),

      personalInfoForm: this.fb.group({
        ticket_reference_number: [''],
        order_id: [''],
        voucher_code: [''],
        document_number: ['', Validators.required],
        document_expiry: ['', Validators.required],
        title: [null, Validators.required],
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
        dateofbirth: ['', Validators.required],
        phonecode: [null, Validators.required],
        mobile: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(12),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        user_category: [null],
        medical:[[]],
        issuing_country: [null, Validators.required],
        passportCategory: [!this.isServiceCenter?'NORMAL':null, Validators.required],
      }),

      emergencyContactForm: this.fb.group({
        emergency_contacts: this.fb.array([
          this.fb.group({
            fullname: ['', Validators.required],
            country_code: [null, Validators.required],
            mobile: [
              '',
              [
                Validators.required,
                Validators.minLength(6),
                Validators.maxLength(12),
              ],
            ],
          }),
          this.fb.group({
            fullname: [''],
            country_code: [null],
            mobile: [
              '',
              [Validators.minLength(6), Validators.maxLength(12)],
            ],
          }),
        ]),
      }),

      preferredCollectionPointForm: this.fb.group({
        delivery_type: ['DHC'],
        service_centre:[null],
        deliver_country: [null],
        address_line_1: [''],
        address_line_2: [''],
        address_line_3: [''],
        address_line_4: [''],
      }),

      termsForm: this.fb.group({
        check: [false, [Validators.requiredTrue]],
        confirm: [false, [Validators.requiredTrue]],
        email_updates: [false]
      }),
    }, { validators: personalInfoValidators });

    this.applicationForm = this.applicantForm.get(
      'applicationForm'
    ) as FormGroup;
    this.uploadDocumentForm = this.applicantForm.get(
      'uploadDocumentForm'
    ) as FormGroup;
    this.personalInfoForm = this.applicantForm.get(
      'personalInfoForm'
    ) as FormGroup;
    this.emergencyContactForm = this.applicantForm.get(
      'emergencyContactForm'
    ) as FormGroup;
    this.preferredCollectionForm = this.applicantForm.get(
      'preferredCollectionPointForm'
    ) as FormGroup;
    this.deliveryInfoForm = this.applicantForm.get(
      'deliveryInfoForm'
    ) as FormGroup;
    this.termsForm = this.applicantForm.get('termsForm') as FormGroup;
  }

  //#region form value set methods
  setApplicantFormValue() {
    this.route.data.pipe(take(1)).subscribe((data) => {
      const { applicantDetail } = data;
      const {
        data: applicantData,
        error,
      }: ApplicantDetailResolved = applicantDetail;

      if (error) {
        this.applicant_error = error;
        return;
      }

      const {
        faceIDScore,
        docQualityScore,
        bioMatchId,
        serivceCenterCode,
        isChildApplication,
        parentFanIdNo,
        registrationServiceCenterCode,
        submissionType
      } = applicantData;

      this.metadata$ = this.metadata$.pipe(map(metadata => {
        const { fancategories, ...rest } = metadata;
        const isBulkSubmission = [1,2].includes(submissionType);
        const filterFn = fanidCategoryFilterFn(!isBulkSubmission);
        const _fancategories = fancategories.filter(filterFn);
        return  { ...rest, fancategories: _fancategories };
      }))

      this.FaceIDScore = faceIDScore;
      this.DocQualityScore = docQualityScore + '';
      this.BioMatchId = bioMatchId;
      this.serviceCenterCode = serivceCenterCode;
      this.registrationServiceCenterCode = registrationServiceCenterCode;
      this.IschildApplication = isChildApplication;
      this.RefParentfanIdNo = parentFanIdNo;

      const {
        applicationTypeCode: application_type,
        customerCategoryCode: fan_category,
        currentResidentCountryCode: current_country,
        nationalityCode: nationality,
        applicationNo,
        arrivalDate,
        userCategoryCode: user_category
      } = applicantData;

      const _arrivalDate = new Date(arrivalDate);
      const estimated_arrival = arrivalDate && fromJSDate(_arrivalDate);

      this.applicationNo = applicationNo;

      const application_form_data = {
        application_type,
        gcc_country: current_country,
        fan_category,
        current_country,
        nationality,
        estimated_arrival,
        user_category
      };
      this.setApplicationFormValue(application_form_data);

      const {
        profilePic,
        docTypeId: document_type,
        docImageFront,
        accommodationPic
      } = applicantData;
      const upload_form_data = {
        document_front: '',
        user_image: '',
        document_type,
        docImageFront,
        profilePic,
        accommodationPic
      };
      this.uploadFormComponent.doc_front_selected = true;
      this.uploadFormComponent.doc_front_name = 'document_front.jpg';
      if(accommodationPic) {
        this.uploadFormComponent.doc_proof_selected = true;
        this.uploadFormComponent.doc_proof_name = 'proof_of_accomodation.jpg';
      }
      this.setUploadDocumentFormValue(upload_form_data);

      const {
        ticketNo: ticket_reference_number,
        ticketOrderId: order_id,
        voucherCode: voucher_code,
        dateofBirth,
        docExpiryDate,
        documentIdNo: document_number,
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
        DocIssuingAuthority: issuing_country,
        medicalInformationId: medical,
        docSubType:passportCategory
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
      const personal_form_data = {
        ticket_reference_number,
        order_id,
        voucher_code,
        document_number,
        dateofbirth: {
          ...dob,
        },
        document_expiry: {
          ...doce,
        },
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
        user_category: null, //*TODO confirm
        issuing_country,
        medical: medical ? medical.split(',').map(Number) : [],
        passportCategory:passportCategory
      };

      this.setPersonalInfoFormValue(personal_form_data);
      this.prf.service_centre.patchValue(serivceCenterCode);

      this.pf.phonecode.disable();
      this.pf.mobile.disable();
      this.pf.email.disable();

      const {
        emergencyContactOneFullName,
        emergencyContactOnePhoneAreaCode,
        emergencyContactOnePhone,
        emergencyContactTwoFullName,
        emergencyContactTwoPhoneAreaCode,
        emergencyContactTwoPhone,
        optInMarketing: email_updates
      } = applicantData;
      const emergency_contacts = [
        {
          fullname: emergencyContactOneFullName,
          country_code: emergencyContactOnePhoneAreaCode,
          mobile: emergencyContactOnePhone,
        },
        {
          fullname: emergencyContactTwoFullName,
          country_code: emergencyContactTwoPhoneAreaCode,
          mobile: emergencyContactTwoPhone,
        },
      ];
      this.setEmergencyContactFormValue(emergency_contacts);

      const terms_form_data = { check: true, confirm: true, email_updates };
      this.setTermsFormValue(terms_form_data);
    });
  }

  setApplicationFormValue(data: any) {
    const {
      application_type,
      gcc_country,
      fan_category,
      current_country,
      nationality,
      estimated_arrival,
      user_category
    } = data;
    this.applicationForm.patchValue({
      application_type,
      gcc_country,
      fan_category,
      current_country,
      nationality,
      estimated_arrival,
      user_category
    });
  }

  async setUploadDocumentFormValue(data: any) {
    const { document_type, profilePic, docImageFront } = data;
    this.uploadDocumentForm.patchValue({
      // user_image_url,
      document_type,
    });

    this.spinner.show('upload-info-image')
    const userImageUrl = this.applicantService.composeImageUrl(
      profilePic,
      false,
    );
    if (userImageUrl) {
      const imageBlob = await this.applicantService
        .getImageBlob(userImageUrl)
        .pipe(take(1))
        .toPromise()
        .catch(err => {
          console.log('userImageBlob', err);
          return null;
        })

      if(imageBlob) {
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

    const docImageUrl = this.applicantService.composeImageUrl(
      docImageFront,
      false,
    );
    if (docImageUrl) {
      const imageBlob = await this.applicantService
        .getImageBlob(docImageUrl)
        .pipe(take(1))
        .toPromise()
        .catch(err => {
          console.log('docImageBlob', err);
          return null;
        })

      if(imageBlob) {
        this.uf.document_front.patchValue(imageBlob);
        const reader = new FileReader();
        reader.readAsDataURL(imageBlob);
        reader.onload = () => {
          this.uf.document_front_src.patchValue(reader.result as string);
        };
      }
    }
    this.spinner.hide('upload-info-image')

  }

  setPersonalInfoFormValue(data: any) {
    const {
      ticket_reference_number,
      order_id,
      voucher_code,
      document_number,
      document_expiry,
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
      dateofbirth,
      phonecode,
      mobile,
      email,
      user_category,
      issuing_country,
      medical,
      passportCategory
    } = data;

    this.personalInfoForm.patchValue({
      ticket_reference_number,
      order_id,
      voucher_code,
      document_number,
      document_expiry,
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
      dateofbirth,
      phonecode,
      mobile,
      email,
      user_category,
      issuing_country,
      medical,
      passportCategory
    });
  }

  setEmergencyContactFormValue(data: any) {
    console.log({ emergency_contacts: data });
    if (data?.length) {
      (this.emergencyContactForm.get(
        'emergency_contacts'
      ) as FormArray).setValue(data);
    }
  }

  setDeliveryInfoFormValue(data: any) {
    const {
      delivery_type,
      service_centre,
      deliver_country,
      address_line_1,
      address_line_2,
      address_line_3,
      address_line_4,
    } = data;
    this.deliveryInfoForm.patchValue({
      delivery_type,
      service_centre,
      deliver_country,
      address_line_1,
      address_line_2,
      address_line_3,
      address_line_4,
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

  get nationality() {
    return this.af.nationality;
  }

  get uf() {
    return this.uploadDocumentForm.controls;
  }

  get document_type() {
    return this.uf.document_type;
  }

  get pf() {
    return this.personalInfoForm.controls;
  }

  get document_expiry() {
    return this.pf.document_expiry;
  }

  get document_number() {
    return this.pf.document_number;
  }

  get title() {
    return this.pf.title;
  }

  get firstname() {
    return this.pf.firstname;
  }

  get lastname() {
    return this.pf.lastname;
  }

  get dateofbirth() {
    return this.pf.dateofbirth;
  }

  get gender() {
    return this.pf.gender;
  }

  get prf() {
    return this.preferredCollectionForm.controls;
  }

  //#endregion uploadDocumentForm getters

  clearData() {
    this.applicantForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.user_image_src = null;
    this.FaceIDScore = null;
    this.BioMatchId = null;
    this.DocQualityScore = null;

    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
  }

  //#region ocr methods

  uploadDocument() {
    this.BioMatchId = this.applicantService.generateDefaultBiomatchID();
    this.FaceIDScore = 100;
    this.DocQualityScore = '100';
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
        field: this.pf.issuing_country,
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
    ]

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
        field: this.pf.issuing_country,
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
        field: this.gender
      }
    ]

    fields_to_patch.forEach(patchOCRfield)
  }

  closeOCRError() {
    this.ocr_error = null;
  }

  //#endregion ocr methods

  async submitForm() {
    this.confirm_submit_open = true;
  }

  cancel() {
    this.redirectToList();
  }

  redirectToList() {
    this.router.navigate(['main/card-replacement/list']);
  }

  register() {
    const formValue = [
      this.applicationForm.getRawValue(),
      this.uploadDocumentForm.getRawValue(),
      this.personalInfoForm.getRawValue(),
      this.preferredCollectionForm.getRawValue()
    ];

    let applicationInsertBody: CustomerCardApplicationInsertRequest = formValue.reduce(
      (prev, curr) => {
        const formComposed = this.applicantService.composeApplicationInsertRequest(
          curr
        );
        return { ...prev, ...formComposed };
      },
      {}
    );

    // *TODO remove once liferay removes doc_back
    const { DocImageFront } = applicationInsertBody;

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

    // *TODO update RefSystemUser_Id, Channel once they're implemented
    const RefSystemUser_Id = 3;
    const Channel = 2;

    const [deliverytype, eventname] = [
      'DHC',
      this.menuService.getSelectedEventCode(),
    ];

    // *TODO OCR dependent fields
    // facidscore = matchscore
    // classificationScore = DocQualityScore
    const [DocQualityScore, FaceIDScore, BackgroundCheckStatus, BioMatchId] = [
      +this.DocQualityScore,
      this.FaceIDScore,
      0,
      this.BioMatchId,
    ];

    const DocSubType = this.personalInfoForm.get('passportCategory').value ?? 'NORMAL';
    //  1 - for excel upload
    //  2- bulk registration manual registration
    //  3 - SC registration
    const SubmissionType = 3;

    const { emergency_contacts } = this.emergencyContactForm.value

    const {
      country_code: EmergencyContactOnePhoneAreaCode,
      fullname: EmergencyContactOneFullName,
      mobile: EmergencyContactOnePhone,
    } = emergency_contacts[0];
    const {
      country_code: EmergencyContactTwoPhoneAreaCode,
      fullname: EmergencyContactTwoFullName,
      mobile: EmergencyContactTwoPhone,
    } = emergency_contacts[1];

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
      RefSystemUser_Id,
      Channel,
      RefCardDeliveryType_Code: deliverytype,
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
      RefRegServiceCenter_Code: this.menuService.getTerminalCode(),
      EmergencyContactOneFullName,
      EmergencyContactOnePhoneAreaCode,
      EmergencyContactOnePhone,
      EmergencyContactTwoFullName,
      EmergencyContactTwoPhoneAreaCode,
      EmergencyContactTwoPhone,
      // *TODO remove once liferay removes doc_back
      DocImageBack: DocImageFront,
      RefResidentCountry_Code: RefCurrentResidentCountry_Code,
      submitReasonType: +this.submitReasonType,
      FanIdNo: this.fanId,
      ApplicationNo: this.applicationNo
    };

    if(!arrivalDate) {
      delete applicationInsertBody.arrivalDate;
    }

    this.applicantService
      .register(applicationInsertBody)
      .pipe(take(1))
      .subscribe(
        (response) => {
          console.log({ response });
          this.redirectToList();
        },
        (err) => {
          console.log({ err });
          this.register_error = err?.error?.message || "Something went wrong!";
        }
      );
  }

  onRegisterError(event) {
    this.register_error = null
    event === 'close' || this.redirectToList();
  }

  closedialog(event: any) {
    this.confirm_submit_open = false;
    event === 'true' && this.register();
  }
  clearDataAFterSwitch(event){
    const { email } = this.personalInfoForm.getRawValue();
    const { mobile } = this.personalInfoForm.getRawValue();
    const { phonecode } = this.personalInfoForm.getRawValue();

    this.applicationForm.get('user_category').patchValue(null);
    this.uploadDocumentForm.reset();
    this.personalInfoForm.reset();
    // this.cardChoiceForm.reset();
    this.termsForm.reset();
    this.termsForm.get('email_updates').patchValue(false);
    // this.cardChoiceForm.get('receive_card').patchValue(false);
    this.fan_category.patchValue('CG');
    // this.personalInfoForm.get('phonecode').patchValue(FORM_PLACEHOLDERS.phonecode);
    // this.personalInfoForm.get('mobile').patchValue(FORM_PLACEHOLDERS.mobile);
    this.pf.contactcode.patchValue(FORM_PLACEHOLDERS.phonecode);
    this.uploadFormComponent.resetDocProof();
    this.uploadFormComponent.resetDocFront();
    this.uploadFormComponent.user_image_src = null;
    // this.upload_form_submitted = false;
    this.FaceIDScore = 100;
    // this.BioMatchId = this.registrationFormService.applicant.generateDefaultBiomatchID();
    this.DocQualityScore = '100';

    this.pf.phonecode.enable();
    this.pf.mobile.enable();
    this.pf.email.enable();
    // this.ocr_fields_patched.forEach(resetPatchedOCRfield);
    this.pf.email.patchValue(email, { emitEvent: false });
    this.pf.phonecode.patchValue(phonecode, { emitEvent: false });
    this.pf.mobile.patchValue(mobile, { emitEvent: false });

  }
}
