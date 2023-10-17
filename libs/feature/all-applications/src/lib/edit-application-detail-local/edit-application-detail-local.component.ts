import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  MetadataResolve,
  ApplicantDetailResolved,
  ApplicantService,
  CustomerCardApplicationInsertRequest,
  TournamentType,
} from "@fan-id/api/server";
import { Environment, FanIDConfig, MenuService, ScrollService } from "@fan-id/core";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { DomSanitizer } from "@angular/platform-browser";
import { convertNgbDateToISO } from "@fan-id/shared/utils/date";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { UploadDocumentFormLocalComponent } from "libs/shared/shared-forms/src/lib/form-manual-components";
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'fan-id-edit-application-detail-local',
  templateUrl: './edit-application-detail-local.component.html',
  styleUrls: ['./edit-application-detail-local.component.scss']
})
export class EditApplicationDetailLocalComponent implements OnInit {

  translateKey = 'EditApplication';
  isServiceCenter = false;
  show_cancel_modal = false;

  applicantForm: FormGroup;
  applicationForm: FormGroup;
  uploadDocumentForm: FormGroup;
  personalInfoForm: FormGroup;
  deliveryInfoForm: FormGroup;
  termsForm: FormGroup;
  emergencyContactForm: FormGroup;
  preferredCollectionForm: FormGroup;

  @ViewChild(UploadDocumentFormLocalComponent, { static: true })
  private uploadFormLocalComponent!: UploadDocumentFormLocalComponent;

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
  RefSystemUser_Id: number;

  ocr_error: string;
  serivceCenterCode: string;
  registrationServiceCenterCode: string;
  from:string;

  resubmit_success = false;
  eventTournamentType: TournamentType = 2;
  applicationStatus = 0;

  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private applicantService: ApplicantService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private scrollService: ScrollService,
    private menuService: MenuService
  ) {}

  ngOnInit(): void {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
    this.fanId = this.route.snapshot.queryParamMap.get('fanid');
    this.submitReasonType = this.route.snapshot.queryParamMap.get('submitReasonType');
    this.from = this.route.snapshot.queryParamMap.get('from');
    if(!this.submitReasonType) {
      this.redirectToList();
    }
    this.metadata$ = this.route.data?.pipe(map((data) => data?.metadata));
    this.initializeFormsLocal();
    this.setApplicantFormLocalValue();

    this.scrollService.scrollToTop();
  }

  initializeFormsLocal(){
    this.applicantForm = this.fb.group({
      applicationForm: this.fb.group({
        application_type: ['QRC'],
        fan_category: ["MTH", Validators.required],
        current_country: ['QA'],
        nationality: [null, Validators.required],
      }),

      uploadDocumentForm: this.fb.group({
        user_image: [''],
        user_image_url: [''],
        user_image_src: [''],
        document_type: ['', Validators.required],
      }),

      personalInfoForm: this.fb.group({
        ticket_reference_number: ['', Validators.required],
        order_id: [''],
        voucher_code: [''],
        document_number: ['', Validators.required],
        document_expiry: [null, Validators.required],
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        gender: [null, Validators.required],
        dateofbirth: ['', Validators.required],
        phonecode: [null, Validators.required],
        mobile: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(15),
          ],
        ],
        email: ['', [Validators.required, Validators.email,Validators.maxLength(40)]],
        medical: [[110], [Validators.required]],
        issuing_country: [null, Validators.required],
        passportCategory: [!this.isServiceCenter?'NORMAL':null, Validators.required],
            }),

      termsForm: this.fb.group({
        check: [false, [Validators.requiredTrue]],
        confirm: [false, [Validators.requiredTrue]],
      }),
    });

    this.applicationForm = this.applicantForm.get(
      'applicationForm'
    ) as FormGroup;
    this.uploadDocumentForm = this.applicantForm.get(
      'uploadDocumentForm'
    ) as FormGroup;
    this.personalInfoForm = this.applicantForm.get(
      'personalInfoForm'
    ) as FormGroup;
    this.termsForm = this.applicantForm.get('termsForm') as FormGroup;
  }

  setApplicantFormLocalValue() {
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
        applicationTypeCode: application_type,
        customerCategoryCode: fan_category,
        currentResidentCountryCode: current_country,
        nationalityCode: nationality,
        applicationNo,
        applicationStatus,
        userId
      } = applicantData;

      this.applicationNo = applicationNo;
      this.applicationStatus = applicationStatus;
      this.RefSystemUser_Id = userId;

      const application_form_data = {
        application_type,
        fan_category,
        current_country,
        nationality,
      };
      this.setApplicationFormLocalValue(application_form_data);

      const {
        profilePic,
        docTypeId: document_type
      } = applicantData;
      const upload_form_data = {
        user_image: '',
        document_type,
        profilePic,
      };
      this.setUploadDocumentFormLocalValue(upload_form_data);

      const {
        ticketNo: ticket_reference_number,
        dateofBirth,
        docExpiryDate,
        documentIdNo: document_number,
        firstName: firstname,
        lastName: lastname,
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
        document_number,
        dateofbirth: {
          ...dob,
        },
        document_expiry: {
          ...doce,
        },
        firstname,
        lastname,
        gender,
        phonecode,
        mobile,
        email,
        user_category: null, //*TODO confirm
        issuing_country,
        medical: medical ? medical.split(',').map(Number) : [],
        passportCategory:passportCategory
      };

      this.setPersonalInfoFormLocalValue(personal_form_data);

      const terms_form_data = { check: true, confirm: true };
      this.setTermsFormLocalValue(terms_form_data);

      if(+this.submitReasonType === 2) {
        this.applicantForm.disable({ emitEvent: false })
      }
    });
  }

  setApplicationFormLocalValue(data: any) {
    const {
      application_type,
      fan_category,
      current_country,
      nationality,
    } = data;
    this.applicationForm.patchValue({
      application_type,
      fan_category,
      current_country,
      nationality,
    });
  }

  async setUploadDocumentFormLocalValue(data: any) {
    const { document_type, profilePic } = data;
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
          this.uploadFormLocalComponent.user_image_src = this.sanitizer.bypassSecurityTrustUrl(
            reader.result as string
        );
          this.uf.user_image_src.patchValue(reader.result);
        };
      }
    }
    this.spinner.hide('upload-info-image')
  }

  setPersonalInfoFormLocalValue(data: any) {
    const {
      ticket_reference_number,
      document_number,
      document_expiry,
      firstname,
      lastname,
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
    this.pf.ticket_reference_number.patchValue(ticket_reference_number, {
      emitEvent: false,
    });
    // this.pf.order_id.patchValue(order_id, { emitEvent: false });
    this.personalInfoForm.patchValue({
      document_number,
      document_expiry,
      firstname,
      lastname,
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

  setTermsFormLocalValue(data: any) {
    const { check, confirm } = data;
    this.termsForm.patchValue({
      check,
      confirm,
    });
  }
  //#region form value local set methods


  //#endregion form value local set methods

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
    // this.uploadFormLocalComponent.resetDocFront();
    this.uploadFormLocalComponent.user_image_src = null;
    this.FaceIDScore = null;
    this.BioMatchId = null;
    this.DocQualityScore = null;
    this.initializeFormsLocal();
  }

  async submitForm() {
    this.confirm_submit_open = true;
  }

  cancel() {
    this.redirectToList();
  }

  redirectToList() {
    if(this.from != null){
      this.router.navigate(['/main/bulk-groups/step-2'], {
        relativeTo: this.route,
        queryParams: {
          bulkGroupName: this.from
        }
      });
    }
    else{
      this.router.navigate(['main/all-applications/list']);
    }
  }

  register() {
    const formValue = [
      this.applicationForm.getRawValue(),
      this.uploadDocumentForm.getRawValue(),
      this.personalInfoForm.getRawValue(),
      // ...[
      //   this.isServiceCenter
      //     ? [this.preferredCollectionForm.getRawValue()]
      //     : [],
      // ],
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
    // const { DocImageFront } = applicationInsertBody;

    const { RefCurrentResidentCountry_Code } = applicationInsertBody;

    let { DateofBirth, DocExpiryDate } = applicationInsertBody;

    DateofBirth = convertNgbDateToISO(
      (DateofBirth as unknown) as NgbDateStruct
    );
    DocExpiryDate = convertNgbDateToISO(
      (DocExpiryDate as unknown) as NgbDateStruct
    );

    const RefSystemUser_Id = this.RefSystemUser_Id;
    const Channel = this.isServiceCenter ? 2 : 8;
    const eventname = this.menuService.getSelectedEventCode();
    const RefRegServiceCenter_Code = this.menuService.getTerminalCode()

    // const [deliverytype, servicecentre, eventname] = [
    //   'SCP',
    //   this.isServiceCenter ? this.prf.service_centre.value : this.serivceCenterCode,
    //   this.menuService.getSelectedEventCode(),
    // ];

    // *TODO OCR dependent fields
    // facidscore = matchscore
    // classificationScore = DocQualityScore
    // const [DocQualityScore, FaceIDScore, BackgroundCheckStatus, BioMatchId] = [
    //   +this.DocQualityScore,
    //   this.FaceIDScore,
    //   0,
    //   this.BioMatchId,
    // ];

    const DocSubType = this.personalInfoForm.get('passportCategory').value ?? 'NORMAL';
    //  1 - for excel upload
    //  2- bulk registration manual registration
    //  3 - SC registration
    const SubmissionType = this.isServiceCenter ? 3 : 2;

  let { RefMedicalInformation_Id } = applicationInsertBody;
    RefMedicalInformation_Id =
      ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

    applicationInsertBody = {
      ...applicationInsertBody,
      RefMedicalInformation_Id,
      DateofBirth,
      DocExpiryDate,
      RefSystemUser_Id,
      Channel,
      RefEvent_Code: eventname,
      DocSubType,
      SubmissionType,
      RefRegServiceCenter_Code,
      RefSerivceCenter_Code: RefRegServiceCenter_Code,
      RefCardDeliveryType_Code: 'DHC',
      RefResidentCountry_Code: RefCurrentResidentCountry_Code,
      IsChildApplication: false,
      submitReasonType: +this.submitReasonType,
      FanIdNo: this.fanId,
      ApplicationNo: this.applicationNo,
      applicationStatus:this.applicationStatus,
      ...(this.from && {
        BulkGroupName: this.from,
      }),
    };

    this.applicantService
      .CustomerPortalRegister(applicationInsertBody)
      .pipe(take(1))
      .subscribe(
        () => {
          this.resubmit_success = true;
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

}
