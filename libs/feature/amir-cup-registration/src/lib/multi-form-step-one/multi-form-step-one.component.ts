import { Component, OnInit } from '@angular/core';
import { MuliformService  } from '@fan-id/api/server';
import { Router } from '@angular/router';
import { RECAPTCHA_SETTINGS, RecaptchaSettings } from "ng-recaptcha";
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
	selector: '[fan-id-multi-form-step-one]',
	templateUrl: './multi-form-step-one.component.html',
	styleUrls: ['./multi-form-step-one.component.scss'],
	providers: [
		{
			provide: RECAPTCHA_SETTINGS,
			useValue: { siteKey: "6Lf4U1YcAAAAAFOTEJu247uqhYN-WDZHpaTR-1G3" , secretKey:"6Lf4U1YcAAAAAK5hLkFiBsLicBtLrgFYBandBpPA"

			} as RecaptchaSettings,
		},
	],
})
export class MultiFormStepOneComponent implements OnInit {
	siteKey="6Lf4U1YcAAAAAFOTEJu247uqhYN-WDZHpaTR-1G3";
	isCaptachaSuccess: boolean=false;
	public multiformdata:any = {
		RefTicketNo:"",
		DocumentIdNo:"",
		DocExpiryDate:"",
		DateofBirth:"",
		RefResidentCountry_Code:"",
		LastName:"",
		ProfilePic:"",
		ApplicationStatus: 2,
		DocSubType:"NORMAL",
		CardStatus: 1,
		Channel: 128,
		RefNationality_Code:"",
		IsBoSyncRespone:false,
		Reason:"New App",
		RefEvent_Code:"AmirCup2021",
		SubmissionType: 5,
		RefTitle_Code:"",
		PrintingStatus: 1,
		PhoneAreaCode:"",
		BackgroundCheckStatus: 1,
		IsBulkRegistrationDraft: false,
		RefMedicalInformation_Id: 110,
		Phone:0,
		IsLifraySyncRespone: false,
		RefAddressNationality_Code:"",
		RefApplicationType_Code: "QRC",
		submitReasonType: 1,
		RefGender_Code:"",
		RefDocType_Id:0,
		FirstName:"",
		RefCardDeliveryType_Code: "DHC",
		Password:"",
		RefSerivceCenter_Code: "QNC",
		RefDocIssuingAuthority_NationalityCode:"",
		Email:"",
		RefCustomerCategory_Code: "MTH",
		IsChildApplication: false,
		SmsOtpCode:"",
		isChild:'',
		refParentApplicationNo:''
	}
	public ticketError:boolean = false;
	public appNumError:boolean = false;
	public selectedApptype:string;

	public apptypes:any = [
		{"name":"Primary / Parent User","value":"false","translation":"MFPOne.Primary"},
		{"name":"Secondary / Child User","value":"true","translation":"MFPOne.Secondary"}
	]

	constructor(
		private mservice:MuliformService,
		private router:Router,
	) { }

	ngOnInit(): void {
		this.getAllData()
		this.mservice.sidebaremitter.emit();
	}
	openSelect(select: NgSelectComponent) {
		select.open();
	}
	onSelectChange(value:any){
		this.multiformdata.isChild = value
		if(value == 'false'){
			this.clearAppError();
			this.multiformdata.Phone = 0
			this.multiformdata.PhoneAreaCode = ''
			this.multiformdata.Email = ''
		}
		this.mservice.setMultiFormData(this.multiformdata)
		this.mservice.sidebaremitter.emit();
	}

	closeSelect(select: NgSelectComponent) {
		select.close();
	}
	getAllData(){
		let data = this.mservice.getMultiFormData()
		if(data){
			if (data.isChild){
				this.selectedApptype = data.isChild
			}
			this.multiformdata = data;
		}else{
			console.log("No data ")

		}
	}
	cleartcktError(){
		this.ticketError = false;
	}
	clearAppError(){
		this.appNumError = false;
	}
	verifyTicket(){
		if(this.multiformdata.isChild == "true"){
			const dataToSend ={
				"refTicketNO": this.multiformdata.RefTicketNo,
				"isChild": this.multiformdata.isChild,
				"refParentApplicationNo": this.multiformdata.refParentApplicationNo,
				"eventCode": "Amircup2021"
			}
			this.mservice.validateApplicationDetails(dataToSend).subscribe((data:any)=>{
				if( data.status == 200){
					this.ticketError = false;
					this.multiformdata.Phone = data.data.parentApplicationDetails.data.phone
					this.multiformdata.PhoneAreaCode = data.data.parentApplicationDetails.data.phoneAreaCode
					this.multiformdata.Email = data.data.parentApplicationDetails.data.email
					this.multiformdata.RefResidentCountry_Code = data.data.parentApplicationDetails.data.refNationality_Code
					this.multiformdata.RefParentFanIdNo = data.data.parentApplicationDetails.data.fanIdNo
					this.mservice.setMultiFormData(this.multiformdata)
					this.router.navigateByUrl("/registration/two");
				}
			},error =>{
				console.log("+++++++++++++++++++++++++++++++++++===")
				console.log(error)
				if(error.error.data.parentApplicationDetails.resultCode == 11){
					this.appNumError = true;
				}
				if(error.error.data.ticketDetails.resultCode == 11 || error.error.data.ticketDetails.resultCode == 23){
					this.ticketError = true;
				}
			});
		}else{
			this.mservice.verifyTicketDetails(this.multiformdata.RefTicketNo).subscribe((data:any)=>{
				if( data.status == 200){
					this.ticketError = false;
					this.mservice.setMultiFormData(this.multiformdata)
					this.router.navigateByUrl("/registration/two");
				}
			},error =>{
				this.ticketError = true;
			});
		}

	}
	checkDisabled(){
		if( !this.isCaptachaSuccess || (this.multiformdata.RefTicketNo == '') || (this.multiformdata.isChild == '' )){
			return true
		}else{
			if(this.multiformdata.isChild == "true") {
				if (this.multiformdata.refParentApplicationNo == ""){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}
		}
	}

	onNext(){
		this.verifyTicket();
	}

	resolved(captchaResponse: string) {
		if(captchaResponse!=null)
		{
			this.isCaptachaSuccess=true;
		}
		else{
			this.isCaptachaSuccess=false;
		}
	}
}
