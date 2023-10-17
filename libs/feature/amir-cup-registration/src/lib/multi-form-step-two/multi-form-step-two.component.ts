import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, OnDestroy  } from '@angular/core';
import { MuliformService } from '@fan-id/api/server';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ResponsiveService } from '@fan-id/core';
import { base64ToFile, ImageCroppedEvent } from 'ngx-image-cropper';
@Component({
	selector: 'fan-id-multi-form-step-two',
	templateUrl: './multi-form-step-two.component.html',
	styleUrls: ['./multi-form-step-two.component.scss'],
})
export class MultiFormStepTwoComponent implements OnInit, OnDestroy, AfterViewInit {
	public multiformdata: any;

	public countries: any;

	RefResidentCountry_Code: string | null = null;
	RefGender_Code: string | null = null;
	PhoneAreaCode: string | null = null;

	public genders = [{ name: 'MALE' }, { name: 'FEMALE' }];
	file_boolean = false;
  cropperShow=false;
	stepTwoForm!: FormGroup;
	minExpiryDate!: NgbDateStruct;
	maxExpiryDate!: NgbDateStruct;
	minBirthDate!: NgbDateStruct;
	maxBirthDate!: NgbDateStruct;

	password_tests = {
    check_1: false,
    check_2: false,
    check_3: false,
    check_4: false,
    check_5: false,
    check_6: false
  };
  password_check_desktop = true;
  password_focus = false;
	password_visible = false;
	confirm_password_visible = false;

	phone_maxlength = 15;
	phone_pattern = '[0-9]*';
	private readonly unsubscribe$ = new Subject<void>();
	public documenterror = false;
	public imagesizeError = false;
	public imagetypeError = false;

  imageChangedEvent: any = '';
  croppedImage: any = '';
  cropperFile:any;
	constructor(
		private mservice: MuliformService,
		private router: Router,
		private fb: FormBuilder,
    private responsiveService: ResponsiveService
	) {
		const today = new Date();
    var yesterday = new Date(new Date().setDate(new Date().getDate()-1));
    var tomorrow = new Date(new Date().setDate(new Date().getDate()+1));

		this.minExpiryDate = {
			year: tomorrow.getFullYear(),
			month: tomorrow.getMonth()+1,
			day: tomorrow.getDate(),
		};
		this.maxExpiryDate = {
			year: today.getFullYear() + 200,
			month: 12,
			day: 31,
		};
		this.minBirthDate = {
			year: today.getFullYear() - 200,
			month: 1,
			day: 1,
		};
		this.maxBirthDate = {
			year: yesterday.getFullYear(),
			month: yesterday.getMonth()+1,
			day: yesterday.getDate()
		};
  //  console.log(this.minExpiryDate,this.maxBirthDate,this.minBirthDate,this.maxExpiryDate,yesterday,tomorrow)

		this.stepTwoForm = this.fb.group(
			{
				profile_pic: [null, Validators.required],
				document_type: [null, Validators.required],
				document_number: [null, Validators.required],
				expiry_date: [null, Validators.required],
				birth_date: [null, Validators.required],
				nationality: [null, Validators.required],
				first_name: [null, Validators.required],
				last_name: [null, Validators.required],
				gender: [null, Validators.required],
				email: [null, Validators.required],
				area_code: [null, Validators.required],
				phone: [null, Validators.required],
				password: [null, [Validators.required, Validators.pattern(/^\S*$/)]],
				confirm_password: [null, Validators.required],
				accept_tnc: [false, Validators.requiredTrue],
			},
			{ validators: this.checkPasswords }
		);
	}

	get f() {
		return this.stepTwoForm.controls;
	}

	openSelect(select: NgSelectComponent) {
		select.open();
	}

	closeSelect(select: NgSelectComponent) {
		select.close();
	}

	ngOnInit(): void {
		this.mservice.getNationalities().subscribe((data: any) => {
			console.log('working', data);
			this.countries = data.dataList;
		});
		this.getAllData();
		this.mservice.sidebaremitter.emit();
	}

  ngAfterViewInit() {
    this.responsiveService.screenWidth$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(screenWidth => {
      this.password_check_desktop = screenWidth > 768;
    });

    const top = document.querySelector('.header-section');
    top && top.scrollIntoView();
  }

	ngOnDestroy(): void {
		this.unsubscribe$.next();
		this.unsubscribe$.complete();
	}

	getAllData() {
		const data = this.mservice.getMultiFormData();
		if (data) {
			this.multiformdata = data;
			const {
				RefResidentCountry_Code,
				RefGender_Code,
				PhoneAreaCode,
				ProfilePic,
				DocumentIdNo,
				RefDocType_Id,
				DocExpiryDate,
				DateofBirth,
				FirstName,
				LastName,
				Email,
				Phone,
				Password
			} = data;

			RefResidentCountry_Code &&
				this.f.nationality.patchValue(RefResidentCountry_Code);
			RefGender_Code && this.f.gender.patchValue(RefGender_Code);
			PhoneAreaCode && this.f.area_code.patchValue(PhoneAreaCode);
			ProfilePic && this.f.profile_pic.patchValue(ProfilePic);
			DocumentIdNo && this.f.document_number.patchValue(DocumentIdNo);
			RefDocType_Id && this.f.document_type.patchValue(RefDocType_Id);
			DocExpiryDate && this.f.expiry_date.patchValue(DocExpiryDate);
			DateofBirth && this.f.birth_date.patchValue(DateofBirth);
			FirstName && this.f.first_name.patchValue(FirstName);
			LastName && this.f.last_name.patchValue(LastName);
			Email && this.f.email.patchValue(Email);
			Phone && this.f.phone.patchValue(Phone);
			Password && this.f.password.patchValue(Password);
      this.croppedImage=ProfilePic;
			if (RefResidentCountry_Code == ""){
				// this.f.nationality.patchValue('QA');
				this.f.area_code.patchValue('+974');

			}
			if(Password){
        this.onPasswordChange(Password)
				this.f.confirm_password.patchValue(Password)
				this.f.accept_tnc.patchValue(true)
				this.f.password.setErrors(null)
			}

			this.file_boolean = !!ProfilePic;
		}
		if(this.multiformdata.isChild == 'true'){
			console.log("is child true")
			this.f.password.clearValidators();
			this.f.confirm_password.clearValidators();

		}
	}

	onProfileChange(event: any) {
		if (event.target.files && event.target.files[0]) {
			const [image]: [File] = event.target.files;
			const { image_valid, image_error } = this.validateImageSize({ image });
			const imgtypevalid =	this.validateImageType({image})

			if (!image_valid) {
				this.imagesizeError = true;
				this.imagetypeError = false;
				this.file_boolean = false;
				this.multiformdata.ProfilePicDisplay = ''
				return;
			}else{
				this.imagesizeError = false;
      }
      if(!imgtypevalid){
				this.imagetypeError = true;
				this.imagesizeError = false;
				this.file_boolean = false;
				this.multiformdata.ProfilePicDisplay = ''
				return;
			}else{
				this.imagetypeError = false;
			}
      if(this.imagetypeError===false)
      {
			const reader = new FileReader();

			reader.onload = (event: ProgressEvent) => {
				this.multiformdata.ProfilePicDisplay = (<FileReader>(
					event.target
				)).result;
			};

			reader.readAsDataURL(event.target.files[0]);
			this.file_boolean = true;
      this.cropperShow=true;
		}

  }    else{
    this.file_boolean=false;
  }

	}

	onPasswordChange(password: string) {
		// - At least 8 characters & Maximum 15 characters
		// - At least 1 uppercase letter
		// - At least 1 lowercase letter
		// - At least 1 number
		// - At least 1 special character i.e. ! @ # $ % & * _
		// - No space allowed
		const atleast8max15_regex = /^.{8,15}$/;
    const atleast1uppercase_regex = /(.*[A-Z].*)/;
    const atleast1lowercase_regex = /(.*[a-z].*)/;
    const atleast1number_regex = /(.*[0-9].*)/;
    const atleast1specialchar_regex = /(.*[!@#$%&*_].*)/;
    const nospace_regex = /^[\S]+$/;

    const [check_1, check_2, check_3, check_4, check_5, check_6] = [
      atleast8max15_regex,
      atleast1uppercase_regex,
      atleast1lowercase_regex,
      atleast1number_regex,
      atleast1specialchar_regex,
      nospace_regex,
    ].map((regex) => regex.test(password));

    this.password_tests = {
      check_1,
      check_2,
      check_3,
      check_4,
      check_5,
      check_6
    }

	}

  onPasswordFocus() {
    if(this.password_check_desktop) return;
    this.password_focus = true;
  }

  onPasswordBlur() {
    if(this.password_check_desktop) return;
    this.password_focus = false;
  }

	checkPasswords: ValidatorFn = (
		group: AbstractControl
	): ValidationErrors | null => {
		const pass = group.get('password')?.value;
		const confirmPass = group.get('confirm_password')?.value;
		return pass === confirmPass ? null : { passwordNotSame: true };
	};

	get passwordValid() {
		return Object.values(this.password_tests).every(Boolean)
	}

  get passwordCheckVisible() {
    if(!this.password_check_desktop) {
      return this.password_focus && !!this.f.password.value;
    }

    return !!this.f.password.value;
  }

	get formInvalid() {
		if(this.multiformdata.isChild == 'true'){
			return this.stepTwoForm.invalid
		}else{
			return this.stepTwoForm.invalid || !this.passwordValid
		}
	}

	onNextClick() {
		this.multiformdata.RefCurrentResidentCountry_Code = this.f.nationality.value;
		this.multiformdata.RefResidentCountry_Code = this.f.nationality.value;
		this.multiformdata.RefNationality_Code = this.f.nationality.value;
		this.multiformdata.RefGender_Code = this.f.gender.value;
		this.multiformdata.PhoneAreaCode = this.f.area_code.value;
		this.multiformdata.ProfilePic = this.f.profile_pic.value;
		this.multiformdata.DocumentIdNo = this.f.document_number.value;
		this.multiformdata.RefDocType_Id = this.f.document_type.value;
		this.multiformdata.DocExpiryDate = this.f.expiry_date.value;
		this.multiformdata.DateofBirth = this.f.birth_date.value;
		this.multiformdata.FirstName = this.f.first_name.value;
		this.multiformdata.LastName = this.f.last_name.value;
		this.multiformdata.Email = this.f.email.value;
		this.multiformdata.Phone = this.f.phone.value;
		this.multiformdata.Password = this.f.password.value;
		if(this.f.nationality.value == "QA"){
			this.multiformdata.country_name = "Qatar"
			this.multiformdata.natCode = "634";
		}
		if(this.multiformdata.RefDocType_Id == "1"){
			const dob = this.multiformdata.DateofBirth
			const expdate = this.multiformdata.DocExpiryDate
			const formatted_dob = dob.year+"-"+dob.month+"-"+dob.day;
			const formatted_expdate =  expdate.year+"-"+expdate.month+"-"+expdate.day;
			const data = {
				"Qid":this.multiformdata.DocumentIdNo,
				"QidCardExpiryDate":formatted_expdate,
				"BirthDate":formatted_dob,
				"NatCode":this.multiformdata.natCode
			}
			this.mservice.validatePersonalDetails(data).subscribe((res:any) =>{
				this.mservice.setMultiFormData(this.multiformdata);
				this.router.navigate(['/registration/three']);

			},error =>{
				console.log(error)
				this.documenterror = true;
				//this.f.document_number.setErrors({"incorrect":true})

			});
		}else{
			this.mservice.setMultiFormData(this.multiformdata);
			this.router.navigate(['/registration/three']);
		}
	}

	validateImageSize({
		image,
		max_size_mb = 2,
	}: {
		image: File;
		max_size_mb?: number;
	}) {
		const MAX_SIZE = max_size_mb * 1024 * 1024;
		const image_size = image?.size || 0;
		const image_valid = image_size <= MAX_SIZE;
		const image_error = `Maximum upload size is ${max_size_mb} MB`;

		return { image_valid, image_error };
	}
	validateImageType({image}:{image:File}){
		const ext = image.type.split("/")[1];
		const imgext_arry = ["JPEG","JPG",'jpeg','jpg',"PNG","png","BMP","bmp"]
		if( imgext_arry.lastIndexOf(ext) >  0){
			return true
		}else{
			return false;
		}

	}

	onNationalityChange(code: string) {
		const country_name_obj = this.countries.filter((item: any) => {
			return item.code == code;
		});
		this.multiformdata.country_name = country_name_obj[0].name;
		this.multiformdata.natCode = country_name_obj[0].natCode;
	}

  //image cropper start

  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
}

imageCropped(event: ImageCroppedEvent) {
  this.croppedImage = event.base64;
  this.cropperFile = base64ToFile(this.croppedImage);
  this.f.profile_pic.patchValue(this.croppedImage);
}
// imageLoaded(image: LoadedImage) {
//     // show cropper
// }
cropperReady() {
    // cropper ready
}
loadImageFailed() {
    // show message
}
confirmCropper(){
  this.multiformdata.ProfilePicDisplay=this.croppedImage;

  this.cropperShow=false
}
removeSpace(event:any){
  // console.log(event.target.value,event.keyCode);
  // if(event.keyCode==32)
  // event.preventDefault();

}
clearSpace(event:any){
  let val=event.target.value +"";
    val=val.replace(/\s/g, "");
  console.log("print",val)
  this.stepTwoForm.patchValue({last_name:val});

}
clearfirstSpace(event:any){
  let val=event.target.value +"";
    val=val.replace(/\s/g, "");
  console.log("print",val)
  this.stepTwoForm.patchValue({first_name:val});

}
  //end
}
