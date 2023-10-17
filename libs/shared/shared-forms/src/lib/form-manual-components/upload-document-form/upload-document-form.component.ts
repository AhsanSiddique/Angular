import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { distinctUntilChanged, map, startWith, take, takeUntil, tap } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageCropperConfig } from '../image-croppper/image-croppper.component';
import { dataUrlToFile, nationalitySearchFn } from '@fan-id/shared/utils/common';
import { ApplicantService, ApplicationStatus, CustomerCardApplicationGetListResponse, IValidateHayyaAppCreateEligibilityRequest, MetadataResolve, MetadataService, TICAODocumentInformation } from '@fan-id/api/server';
import { getDocumentMinExpiryDate, getQIDExpNgb, getThreeMonthsFromToday, getTodayNgb, TMinDocumentExpiryDateType, toJSDate } from '@fan-id/shared/utils/date';
import { getFormExtras, IFormExtras, invalidNationalitiesForA3Visa, isCountryGCC, oldCategories, registrationFormValidators } from '@fan-id/shared/utils/form';
import { NgbCalendar, NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { getRegulaDetectFaceQualityErrorMessages } from '@fan-id/shared/utils/ocr';
@Component({
  selector: 'fan-id-upload-document-form',
  templateUrl: './upload-document-form.component.html',
  styleUrls: ['./upload-document-form.component.scss'],
})
export class UploadDocumentFormComponent
  extends FormGroupInput
  implements OnInit, OnDestroy {
  @Input() application_type: FormControl;
  @Input() nationality: FormControl;
  @Input() fan_category: FormControl;
  @Input() user_category?: FormControl;
  @Input() isServiceCentre?: boolean;
  @Input() disable_form?: boolean;
  @Input() metadata$: Observable<MetadataResolve>;
  @Input() editApp?: boolean = false;
  @Input() isExcel?: boolean = false;
  @Input() isDependent?: boolean = false;
  @Input() qid_validated?: boolean = false;
  @Input() passport_validated?: boolean = false;
  @Input() face_validated?: boolean = false;
  @Input() isQidCallDone?: boolean = true;
  @Input() showICAO?: boolean = false;
  @Input() icao_data?: TICAODocumentInformation;
  @Input() applicantData?: CustomerCardApplicationGetListResponse;
  @Output() formSubmit = new EventEmitter();
  @Output() passportSubmit = new EventEmitter();
  @Output() qidCleared = new EventEmitter();
  @Output() faceValidationChanged = new EventEmitter<boolean>();
  @Output() passportBlur = new EventEmitter();
  @Output() canUserApplyValid = new EventEmitter<boolean>();

  canUserApply$ = new BehaviorSubject<boolean>(false);
  _canUserApply$ = this.canUserApply$.asObservable();
  canUserApplyError$ = new BehaviorSubject<string>('');
  formExtras: IFormExtras;
  invalidNationalityError$ = new BehaviorSubject<string>('');

  constructor(
    public sanitizer: DomSanitizer,
    private applicantService: ApplicantService,
    private calendar: NgbCalendar,
    private metadata:MetadataService
  ) {
    super();
  }

  document_types = [
    { id: 1, name: 'QID' },
    { id: 3, name: 'Passport' }
  ]
  scannedImage: string;
  user_image_src: any;
  show_upload_photo_modal = false;
  showCropper = false;
  doc_front_selected = false;
  doc_front_name = '';
  document_front_label = 'Document';
  showConnectionMessage: boolean;
  icao_expanded = false;
  private readonly unsubscribe$ = new Subject<void>();
  public socket = new WebSocket('ws://localhost:8200');

  user_image_to_crop: string;
  user_image_cropper_config: ImageCropperConfig = {
    maintainAspectRatio: true,
    aspectRatio: 3 / 4,
  };
  doc_image_to_crop: string;
  doc_image_cropper_config: ImageCropperConfig = {
    maintainAspectRatio: false,
    aspectRatio: 8 / 5,
  };

  doc_proof_selected = false;
  doc_proof_name = '';
  proof_image_to_crop: string;
  proof_image_cropper_config: ImageCropperConfig = {
    maintainAspectRatio: true,
    aspectRatio: 8 / 5,
  };

  document_number_label = 'Document';
  minDOBDate = undefined;
  maxDOBDate = undefined;
  maxEXPDate = undefined;
  minEXPDate = undefined;
  documentMask = 'A*';

  editDocNumber = 0;
  editNat: string;
  editDocType: string;
  editNatChangeChecker: string;
  editDocChangeChecker: string;
  expDateDisable = false;
  editExpiryDate:any;

  show_face_error_modal = false;
  face_errors: string[] = [];
  documentImageSrc: string | null = null;
  showImageModal = false;

  initialDocumentNumber;
  initialNationality;
  hayyaCategories :any[];

  ngOnInit() {
    this.metadata.getRegUserCategories({}).subscribe(
       (categories) => {
        this.hayyaCategories=categories;
    });
    this.formExtras = getFormExtras(this.parentForm);
    this.editExpiryDate = this.uf.document_expiry.value;
    this.setDateMinMax();
    this.initializeWebSocket();
    // *for debug
    // this._canUserApply$.pipe(takeUntil(this.unsubscribe$)).subscribe(console.log);

    this.application_type.valueChanges
      .pipe(
        startWith(this.application_type?.value),
        distinctUntilChanged(),
        takeUntil(this.unsubscribe$)
      )
      .subscribe(val => {
        console.log({ application_type_upload: val });
        if(!val) {
          this.uf.document_type.setValue(null)
        } else if (val !== 'QRC') {
          this.uf.document_type.setValue(3)
        } else {
          this.uf.document_type.setValue(1)
        }
      })

    this.document_type.valueChanges
      .pipe(startWith(this.document_type?.value), takeUntil(this.unsubscribe$))
      .subscribe((val) => {
        this.setDocumentFrontValidation();
        if (!val) {
          this.document_front_label = 'Document';
          this.document_number_label = 'Document';
        } else if (val === 3) {
          this.document_front_label = 'Passport';
          this.expDateDisable = false;
          this.document_number_label = 'Passport';
          this.documentMask = 'A*';
          this.uf.document_number.clearValidators();
          this.uf.document_number.setValidators([
            Validators.required,
            Validators.maxLength(20),
          ]);
          this.formGroup.updateValueAndValidity();
        } else {
          // this.document_front_label = "QID"
          this.document_number_label = 'QID';
          this.documentMask = '0*';
          this.uf.document_number.clearValidators();
          this.uf.document_number.setValidators([
            Validators.required,
            Validators.pattern(/^\d{11}$/),
          ]);
          this.formGroup.updateValueAndValidity();
        }

        const current_issuing_country = this.uf.issuing_country.value ?? null;
        const issuing_country = val === 1 ? 'QA' : current_issuing_country;
        this.uf.issuing_country.patchValue(issuing_country, {
          emitEvent: false,
        });
        // if (!this.isVIP) {
          if (val === 3) {
            this.uf.passportCategory.setValidators([Validators.required]);
            this.uf.passportCategory.updateValueAndValidity();
          } else {
            this.uf.passportCategory.clearValidators();
            this.uf.passportCategory.updateValueAndValidity();
          }
        // }

        this.minEXPDate =
          val === 3 ? this.getDocumentMinExpiryDate() : getTodayNgb();
        if (val) {
          this.qidNatAndChildCheck();
        }
      });

    if (this.user_category) {
      this.user_category.valueChanges
        .pipe(
          distinctUntilChanged(),
          takeUntil(this.unsubscribe$),
        )
        .subscribe(() => {
          if (this.document_type.value === 3) {
            this.minEXPDate = this.getDocumentMinExpiryDate();
            this.uf.document_expiry.updateValueAndValidity();
            if (this.editApp) this.uf.document_expiry.markAsTouched();
          }
        }
      )
    }

    // this.formGroup.valueChanges.pipe(takeUntil(this.unsubscribe$)).subscribe({
    //   next: (val) => {
    //     const isValidateButtonDisabled = this.canUserApply$.value === false;
    //     if (isValidateButtonDisabled) {
    //       this.canUserApply$.next(true);
    //       this.canUserApplyValid.emit(false);
    //     }
    //   }
    // });

    if (this.isExcel && this.isQidCallDone === false) {
      this.uploadDocument();
    }

    const { document_number, nationality } = this.uf;
    this.initialDocumentNumber = document_number.value;
    this.initialNationality = nationality.value;
    // console.log(this.initialDocumentNumber, this.initialNationality);

    this.setCanUserApplyListener();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  initializeWebSocket() {
    this.socket = new WebSocket('ws://localhost:8200');

    this.socket.onerror = () => {
      this.socket.close();
    };
    this.socket.onmessage = (message) => {
      console.log('initializeWebSocket', message);

      const objectUrl = URL.createObjectURL(message.data);
      this.scannedImage = objectUrl;
      this.showCropper = true;
    };
  }

  scanImage(type: any) {
    if (
      this.socket.readyState === WebSocket.CONNECTING ||
      this.socket.readyState === WebSocket.CLOSED ||
      this.socket.readyState === WebSocket.CLOSING
    ) {
      const link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = 'assets/scanner/FanIdScannerInterface.exe';
      link.download = 'FanIdScannerInterface.exe';
      document.body.appendChild(link);
      link.click();
      link.remove();
      this.socket.close();
      this.showConnectionMessage = true;
    } else {
      this.scan();
    }
  }

  scan() {
    this.socket.send('scanImg');
  }

  get uf() {
    return this.formGroup.controls;
  }

  get pf() {
    return (this.parentForm.controls.personalInfoForm as FormGroup).controls;
  }

  get document_type() {
    return this.uf.document_type;
  }

  onUploadUserImageClick(event) {
    if (this.isServiceCentre && !this.disable_form) {
      event.preventDefault();
      this.show_upload_photo_modal = true;
    }
  }

  closeUploadPhotoModal() {
    this.show_upload_photo_modal = false;
  }

  closeFaceErrorModal() {
    this.show_face_error_modal = false;
    this.resetUserImage();
  }

  initializeWebSocketandScan() {
    this.socket = new WebSocket('ws://localhost:8200');
    this.socket.onopen = () => {
      this.scanImage('1');
    };
    this.socket.onerror = () => {
      this.socket.close();
    };
    this.socket.onmessage = (message) => {
      console.log('initializeWebSocketandScan', message);

      const objectUrl = URL.createObjectURL(message.data);
      this.scannedImage = objectUrl;
      this.showCropper = true;
    };
  }

  closeCommonDialog() {
    this.initializeWebSocketandScan();
    this.showConnectionMessage = false;
  }

  //#region file select handlers
  onUserImageChange(event) {
    if (event.target.files && event.target.files.length) {
      const [image]: [File] = event.target.files;
      if (!image.type.startsWith('image/jpeg')) {
        window.alert('Please upload a jpg/jpeg file');
        return;
      }
      const { image_valid, image_error } = this.validateImageSize({ image });
      if (!image_valid) {
        window.alert(image_error);
        return;
      }
      this.formGroup.patchValue({
        user_image: image,
      });
      this.validateFaceInUserImage();

      const reader = new FileReader();
      reader.readAsDataURL(image);
      reader.onload = () => {
        this.user_image_src = reader.result as string;
        // trigger for cropper
        this.isServiceCentre && (this.user_image_to_crop = this.user_image_src);
        this.formGroup.patchValue({
          user_image_src: reader.result,
        });
      };
    }
    this.show_upload_photo_modal = false;
  }

  saveCroppedUserImage(image: Blob) {
    this.user_image_to_crop = null;
    const { image_valid, image_error } = this.validateImageSize({ image });

    if(!image_valid) {
      window.alert(image_error);
      return;
    }

    this.formGroup.patchValue({
      user_image: new File([image], 'user_image.jpg'),
    });
    this.validateFaceInUserImage();

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      this.user_image_src = reader.result as string;
      this.formGroup.patchValue({
        user_image_src: reader.result,
      });
    };
  }

  onDocFrontChange(event) {
    event.stopPropagation();
    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [image]: [File] = event.target.files;
      if (!image.type.startsWith('image/jpeg')) {
        window.alert('Please upload a jpg/jpeg file');
        return;
      }
      const { image_valid, image_error } = this.validateImageSize({ image });

      if (!image_valid) {
        window.alert(image_error);
        return;
      }
      this.formGroup.patchValue({
        document_front: image,
      });
      this.doc_front_selected = true;
      this.doc_front_name = image.name;

      reader.readAsDataURL(image);
      reader.onload = () => {
        this.doc_image_to_crop = reader.result as string; //--> trigger for cropper
        this.formGroup.patchValue({
          document_front_src: (reader.result as string).split(',')[1],
        });
      };
    }
  }

  saveCroppedDocImage(image: Blob) {
    this.doc_image_to_crop = null;
    const { image_valid, image_error } = this.validateImageSize({ image });

    if(!image_valid) {
      this.resetDocFront();
      window.alert(image_error);
      return;
    }

    this.formGroup.patchValue({
      document_front: new File([image], 'doc_image.jpg'),
    });
    this.doc_front_selected = true;
    this.doc_front_name = 'document-front.jpeg';
    this.passport_validated = false;

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onload = () => {
      this.formGroup.patchValue({
        document_front_src: (reader.result as string).split(',')[1],
      });
    };
  }

  onDocProofChange(event) {
    event.stopPropagation();

    const reader = new FileReader();

    if (event.target.files && event.target.files.length) {
      const [image]: [File] = event.target.files;
      if (!image.type.startsWith('image/jpeg')) {
        window.alert('Please upload a jpg/jpeg file');
        return;
      }
      const { image_valid, image_error } = this.validateImageSize({ image });
      if (!image_valid) {
        window.alert(image_error);
        return;
      }
      this.formGroup.patchValue({
        document_proof: image,
      });
      this.doc_proof_selected = true;
      this.doc_proof_name = image.name;

      reader.readAsDataURL(image);

      reader.onload = () => {
        // trigger for cropper
        // this.proof_image_to_crop = reader.result as string;
        this.formGroup.patchValue({
          document_proof_src: (reader.result as string).split(',')[1],
        });
      };
    }
  }

  saveCroppedProofImage(image: Blob) {
    this.proof_image_to_crop = null;
    const reader = new FileReader();

    const { image_valid, image_error } = this.validateImageSize({ image });

    if (!image_valid) {
      window.alert(image_error);
      return;
    }
    this.formGroup.patchValue({
      document_proof: new File([image], 'doc_proof_image.jpg'),
    });
    this.doc_proof_selected = true;
    this.doc_proof_name = 'document-proof.jpeg';

    reader.readAsDataURL(image);

    reader.onload = () => {
      this.uf.document_proof_src.patchValue((reader.result as string).split(',')[1]);
    };
  }
  //#endregion file select handlers

  validateImageSize({
    image,
    max_size_mb = 2,
  }: {
    image: File | Blob;
    max_size_mb?: number;
  }) {
    // console.log({ imagesize: image?.size });
    const MAX_SIZE = max_size_mb * 1024 * 1024;

    const image_size = image?.size || 0;
    const image_valid = image_size <= MAX_SIZE;
    const image_error = `Maximum upload size is ${max_size_mb} MB`;

    return { image_valid, image_error };
  }

  validateFaceInUserImage() {
    if (this.isServiceCentre) {
      this.faceValidationChanged.emit(true);
      return;
    }
    this.face_errors = [];
    this.face_validated = false;
    let profileImage = this.uf.user_image.value;
    profileImage = new File([profileImage], 'user_image.jpg');
    this.applicantService.detectFaceByFile(profileImage)
      .pipe(take(1))
      .subscribe(
        (res) => {
          if(res?.data?.code === 0) {
            const { quality, crop } = res.data.results?.detections?.[0] ?? {};
            const { details } = quality ?? {};
            this.face_errors = getRegulaDetectFaceQualityErrorMessages(details);
            this.face_validated = this.face_errors.length === 0;

            const base64 = 'data:image/jpeg;base64,' + crop;
            const image = dataUrlToFile(base64, 'user_image.jpg');
            this.uf.user_image.patchValue(image);
            this.uf.user_image_src.patchValue(base64);
            this.user_image_src = base64;
            if(this.passport_validated) {
              this.resetDocFront();
              this.passportSubmit.emit();
            }
          } else {
            this.face_validated = false;
            this.face_errors = ['No Face Detected'];
          }

          if(!this.face_validated) {
            this.show_face_error_modal = true;
          }
          this.faceValidationChanged.emit(this.face_validated);
        },
        (err: unknown) => {
          console.log({ err });
          this.face_validated = false;
          this.face_errors = ['Some Error Occured, Please Try Again'];
          this.show_face_error_modal = true;
          this.faceValidationChanged.emit(this.face_validated);
        }
      )
  }

  resetUserImage() {
    this.user_image_src = null;
    this.uf.user_image.patchValue(null);
    this.uf.user_image_src.patchValue(null);
    this.face_validated = false;
    this.face_errors = [];
    this.faceValidationChanged.emit(this.face_validated);
  }

  resetDocFront() {
    this.doc_front_selected = false;
    this.doc_front_name = '';
    this.passport_validated = false;
    this.uf.document_front.reset();
    this.uf.document_front_src.reset();
    this.uf.document_front.enable();
  }

  resetDocProof() {
    this.doc_proof_selected = false;
    this.doc_proof_name = '';
    this.uf.document_proof.reset();
    this.uf.document_proof_src.reset();
    this.uf.document_proof.enable();
  }

  resetDoc(event, doc: string) {
    event.preventDefault();
    doc === 'front' && this.resetDocFront();
    doc === 'proof' && this.resetDocProof();
  }

  uploadDocument() {
    this.formSubmit.emit();
  }

  uploadPassport() {
    if(!this.isServiceCentre) {
      if(!this.face_validated) {
        this.show_face_error_modal = true;
        return;
      }
      this.passportSubmit.emit();
    }
  }

  clearQID() {
    this.qidCleared.emit();
    this.qid_validated = false;
  }

  storeImageandClose(event) {
    this.scannedImage = event;
    this.showCropper = false;

    this.formGroup.patchValue({
      document_front: this.scannedImage,
    });
    this.doc_front_selected = true;
    this.doc_front_name = 'scannedImage.jpeg';

    this.formGroup.patchValue({
      document_front_src: this.scannedImage,
    });
  }

  setProofOfAccommodationValidation() {
    if (this.document_type.value === 3 && !this.isVIP) {
      this.uf.document_proof.setValidators([Validators.required]);
      this.uf.document_proof_src.setValidators([Validators.required]);
      this.uf.document_proof.updateValueAndValidity();
      this.uf.document_proof_src.updateValueAndValidity();
    } else {
      this.uf.document_proof.clearValidators();
      this.uf.document_proof_src.clearValidators();
      this.uf.document_proof.updateValueAndValidity();
      this.uf.document_proof_src.updateValueAndValidity();
    }
  }

  setDocumentFrontValidation() {
    if (this.document_type.value === 1) {
      this.uf.document_front.clearValidators();
      this.uf.document_front_src.clearValidators();
      this.uf.document_front.updateValueAndValidity();
      this.uf.document_front_src.updateValueAndValidity();
    } else {
      this.uf.document_front.setValidators([Validators.required]);
      this.uf.document_front_src.setValidators([Validators.required]);
      this.uf.document_front.updateValueAndValidity();
      this.uf.document_front_src.updateValueAndValidity();
    }
  }

  get isVIP() {
    return this.fan_category?.value === 'VIP';
  }

  docRefBlur() {
    this.passportBlur.emit();
  }

  docRefFocus() {
    if (this.uf.document_number.hasError('notValidDoc')) {
      const { notValidDoc, ...errors } = this.uf.document_number.errors;
      this.uf.document_number.setErrors(errors);
      this.uf.document_number.updateValueAndValidity();
    }
  }

  qidNatAndChildCheck() {
    if (this.document_type.value === 1) {
      !this.isVIP &&
        this.uf.document_expiry.setValidators([
          Validators.required,
          registrationFormValidators.doc_expiry(
            this.document_type?.value,
            this.application_type?.value
          ),
        ]);
      this.uf.document_expiry.updateValueAndValidity();
      this.minEXPDate = getQIDExpNgb();
    } else {
      if (this.document_type.value) {
        this.minEXPDate =
          this.document_type.value === 3
            ? this.getDocumentMinExpiryDate()
            : getTodayNgb();
        !this.isVIP &&
          this.uf.document_expiry.setValidators([
            Validators.required,
            registrationFormValidators.doc_expiry(
              this.document_type?.value,
              this.application_type?.value
            ),
          ]);
        this.uf.document_expiry.updateValueAndValidity();
      }
    }
  }

  get nationalitySearchFn() {
    return nationalitySearchFn;
  }

  setDateMinMax(isDependent = this.isDependent) {
    const today = this.calendar.getToday();
    this.maxEXPDate = this.calendar.getNext(today, 'y', 200);
    if(isDependent) {
      this.minDOBDate = this.calendar.getPrev(today, 'y', 18);
      this.maxDOBDate = today;
    } else {
      this.minDOBDate = this.calendar.getPrev(today, 'y', 125);
      // this.maxDOBDate = this.calendar.getPrev(today, 'y', 18);
      this.maxDOBDate = today;
    }
  }

  getDocumentMinExpiryDate() {
    const type2UserCategories = ['APH', 'ACP', 'WF', 'YTH', 'ARTP'];
    const user_category = this.user_category?.value;
    let expiry_type: TMinDocumentExpiryDateType = 1;
    if (type2UserCategories.includes(user_category)) {
      expiry_type = 2;
    }

    return this.getDateBasedonCategory();

  }
  getDateBasedonCategory(){
    const user_category = this.user_category?.value;
    const filteredData = this.hayyaCategories.find(x=>x.code === user_category);
    if(filteredData){
      const today = this.calendar.getToday();
      return this.calendar.getNext(today, 'm', filteredData.daysofExpriy / 30);
     }
    return getThreeMonthsFromToday();
  }

  viewDocument(imagePath: string) {
    const imageURL = this.applicantService.composeImageUrl(imagePath);
    this.applicantService.getImageBlob(imageURL)
    .pipe(take(1))
    .subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      this.documentImageSrc = this.sanitizer.bypassSecurityTrustUrl(url) as string;
      this.showImageModal = true;
    },
    error => {
      console.log({ error });
      window.alert('image error.')
    })
  }

  closeImageModal() {
    this.showImageModal = false;
    this.documentImageSrc = null;
  }

  collapseICAOTable() {
    this.icao_expanded = false;
    document.querySelector('.upload-document-form').scrollIntoView(
      { behavior: 'smooth', block: 'start', inline: 'start' }
    );
  }

  parseMinExpiryDate(ngbDate: NgbDate) {
    const date = toJSDate(ngbDate);
    const day = date.getDate();
    const month_name = date.toLocaleString('en-US', { month: 'long' });
    const year = date.getFullYear();
    return `${day} ${month_name} ${year}`;
  }

  setCanUserApplyListener() {
    if (this.isServiceCentre) {
      const { ticket_type } = (this.parentForm?.controls.ticketForm as FormGroup).getRawValue();

      if (oldCategories.includes(ticket_type?.code)) {
        this.canUserApply$.next(false);
        this.canUserApplyValid.emit(true);
        return;
      }
      const { document_number, nationality } = this.uf;
      combineLatest([
        document_number.statusChanges.pipe(startWith(document_number.status)),
        nationality.statusChanges.pipe(startWith(nationality.status))
      ]).pipe(tap(statuses => {
        if (this.initialDocumentNumber === document_number.value && this.initialNationality === nationality.value) {
          this.canUserApply$.next(false);
          this.canUserApplyValid.emit(true);
          return;
        }
        if ((this.initialDocumentNumber !== document_number.value || this.initialNationality !== nationality.value)
        && (statuses.every(status => status === 'VALID'))) {
          this.canUserApply$.next(true);
          this.canUserApplyValid.emit(false);
        } else {
          this.canUserApply$.next(false);
          this.canUserApplyValid.emit(true);
        }
        // this.canUserApplyValid.emit(false);
      }), takeUntil(this.unsubscribe$)).subscribe();
    } else {
      // this.canUserApply$.next(true);
      // this.canUserApplyValid.emit(false);
      const { document_number, nationality } = this.uf;
      combineLatest([
        document_number.statusChanges.pipe(startWith(document_number.status)),
        nationality.statusChanges.pipe(startWith(nationality.status)),
        this.user_category.statusChanges.pipe(startWith(this.user_category.status))
      ]).pipe(tap(statuses => {
        if (this.initialDocumentNumber === document_number.value && this.initialNationality === nationality.value) {
          if (this.initialDocumentNumber && this.initialNationality) {
            this.canUserApply$.next(false);
            this.canUserApplyValid.emit(true);
            return;
          }
        }

        const isDocumentDetailsNew = this.initialDocumentNumber !== document_number.value || this.initialNationality !== nationality.value;
        const isStatusesValid = statuses.every(status => status === 'VALID');

        if (isDocumentDetailsNew && isStatusesValid) {
          console.log({ statuses, idn: this.initialDocumentNumber, dn: document_number.value, in: this.initialNationality, n: nationality.value });
          this.canUserApply$.next(true);
          this.canUserApplyValid.emit(false);
        } else {
          this.canUserApply$.next(false);
          this.canUserApplyValid.emit(true);
        }
        // this.canUserApplyValid.emit(false);
      }), takeUntil(this.unsubscribe$)).subscribe();
    }
  }

  validateCanUserApply() {
    if (this.canUserApply$.value === false) return;
    const body: IValidateHayyaAppCreateEligibilityRequest = {
      docType: this.document_type.value,
      docNum: this.uf.document_number.value,
      refNationalityCode: this.uf.nationality.value,
      refCustomerCategoryCode: this.fan_category.value,
      refRegUserCategoryCode: this.user_category.value,
      channel: this.isServiceCentre ? 2 : 8,
      hayyaNo: this.applicantData?.hayyaNo,
      fanIdNo: this.applicantData?.fanIdNo,
    }
    if (!this.isServiceCentre) {
      if (this.b2bVisaType === 'TRANSIT') {
        body.refRegUserCategoryCode = 'TRV';
      } else if (this.b2bVisaType === 'CONFERENCE') {
        const applicationForm = this.parentForm?.controls?.applicationForm as FormGroup;
        body.refConferenceEvent_Id = applicationForm.getRawValue().conference_name;
      } else {
        body.refRegUserCategoryCode = 'GP';
      }
    }

    this.applicantService.validateHayyaAppCreateEligibility(body)
      .pipe(map(response => {
        if (response?.data?.returnVal) return response;
        throw new Error(response?.data?.errorMessage || 'Something went wrong.');
      }))
      .subscribe({
        next: () => {
          this.canUserApply$.next(false);
          this.canUserApplyValid.emit(true);
        },
        error: error => {
          console.log({ error });
          // this.canUserApply$.next(false);
          this.canUserApplyValid.emit(false);
          this.canUserApplyError$.next(error);
        }
    });
  }

  // get isUploadDisabled() {
    // if (this.disable_form) return true;
    // if (['FWC', 'VISA'].includes(this.formExtras?.applicationType)) {
    //   return !this.applicantData?.isApprovedOnece;
    // }
    // return false;
    // 1. If the `disable_form` property is set to `true`, uploading is disabled.
    // 2. If the `applicationType` is `'FWC'`, uploading is disabled.
    // 3. If the `applicationType` is `'VISA'`, uploading is enabled unless:
    //  a. The `applicationStatus` is either `'Rejected'` or `'DataError'`. If so, uploading is disabled.
    //  b. The `applicationStatus` is either `'Rejected'` or `'DataError'`, and `isApprovedOnece` is set to `true`. In this case, uploading is also disabled.
    // return this.disable_form ||
    //   this.formExtras?.applicationType === 'FWC' ||
    //   (this.formExtras?.applicationType === 'VISA' &&
    //     ![ApplicationStatus.Rejected, ApplicationStatus.DataError].includes(this.applicantData?.applicationStatus as ApplicationStatus)) ||
    //   (this.formExtras?.applicationType === 'VISA' &&
    //   [ApplicationStatus.Rejected, ApplicationStatus.DataError].includes(this.applicantData?.applicationStatus as ApplicationStatus) && this.applicantData?.isApprovedOnece);
  // }

  get isUploadDisabled() {
    const disableForm = this.disable_form;
    const applicationType = this.formExtras?.applicationType;
    const manualUpload = this.formExtras?.manualUpload;
    const applicationStatus = this.applicantData?.applicationStatus as ApplicationStatus;
    const isApprovedOnce = this.applicantData?.isApprovedOnece;
    const isProfilePicError = this.applicantData?.isProfilePicError;
    const isRejectedOrDataError = [ApplicationStatus.Rejected, ApplicationStatus.DataError].includes(applicationStatus);

    if (disableForm) {
      return true; // Uploading is disabled if the 'disable_form' property is set to true
    }
    if (this.isServiceCentre) {
      if (['VISA'].includes(applicationType) || this.applicantData?.customerCategoryCode == 'NHWM' ) {
        if (isRejectedOrDataError &&( isProfilePicError || (!isProfilePicError && !isApprovedOnce)))
          return false;
      }

      if (['FWC', 'VISA'].includes(applicationType)) {
        if (isRejectedOrDataError && isProfilePicError && isApprovedOnce) return false;
      }

      return true; // Uploading is disabled by default for Service Centre
    }

    if (manualUpload) {
      return false; // Uploading is enabled for manual upload
    }

    return true; // Uploading is disabled by default
  }


  onNationalityChange(event) {
    if (!this.isServiceCentre) {
      // if (this.b2bVisaType === 'TRANSIT') return;
      return;
    }
    const nationalityCode = event?.code;
    if (invalidNationalitiesForA3Visa.includes(nationalityCode)) {
      // if (SchengenCountries.includes(nationalityCode)) {
      //   this.invalidNationalityError$.next("You are not eligible for 'Visa with ETA (A3)', please select another type of visa");
      // } else {
      //   this.invalidNationalityError$.next('You are not eligible for Visa with ETA (A3), please select Tourist Visa (A1)');
      // }
      this.invalidNationalityError$.next("You are not eligible for 'Visa with ETA (A3)', please select another type of visa");
      this.nationality.patchValue(null);
    }
    else if (isCountryGCC(nationalityCode) || nationalityCode == 'QA') {
      this.invalidNationalityError$.next('GCC citizens cannot apply for the selected type of visa');
      this.nationality.patchValue(null);
    }
  }
}
