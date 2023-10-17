import { Component, OnInit, ViewChild } from '@angular/core';
import { MuliformService  } from '@fan-id/api/server';
import {Router} from '@angular/router';
import { CountdownComponent, CountdownEvent } from 'ngx-countdown';

@Component({
	selector: 'fan-id-multi-form-step-four',
	templateUrl: './multi-form-step-four.component.html',
	styleUrls: ['./multi-form-step-four.component.scss']
})
export class MultiFormStepFourComponent implements OnInit {
	public multiformdata:any;
	public mimetype:string;
	public otperror:boolean = false;
  otperror_count = 0;

	SmsOtpCode = '';
	otp_pattern = /^[0-9]{4}$/;

	@ViewChild('cd', { static: false }) private countdown!: CountdownComponent;

	timerConfig = { leftTime: 120, format: "mm:ss" };
	enable_resend_otp = false;
	resend_otp_count = 1;
	resend_otp_success = false;

	constructor(
		private mservice:MuliformService,
		private router:Router
	) { }

	ngOnInit(): void {
		this.getAllData()
		this.mservice.sidebaremitter.emit();
	}

	handleCountdown(e: CountdownEvent) {
		console.log(e)
		if(e.action === 'done') {
			this.enable_resend_otp = true;
		} else if(e.action === 'start' || e.action === 'restart') {
			this.enable_resend_otp = false;
		}
	}


	get sms_otp_valid() {
		return this.otp_pattern.test(this.SmsOtpCode)
	}

	get all_otp_valid() {
		return this.sms_otp_valid;
	}

	resetOtpSendStatus() {
		if(this.resend_otp_success) {
			this.resend_otp_success = false;
		}
		this.otperror = false;
	}

	getAllData(){
		const data = this.mservice.getMultiFormData()
		if(data){
			this.multiformdata = data;
		}

	}
	dataURItoBlob(dataURI:any) {
    console.log(dataURI);
		// convert base64/URLEncoded data component to raw binary data held in a string
		var byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);

		// separate out the mime component
		var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
		console.log(mimeString);
		this.mimetype = mimeString;

		// write the bytes of the string to a typed array
		var ia = new Uint8Array(byteString.length);
		for (var i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ia], {type:mimeString});
	}

	sendsmsandemailotp(){
		this.otperror = false;
		if(this.resend_otp_count >= 3) {
			this.multiformdata.response = 'resend_otp_maxed_out';
			this.multiformdata.errormsg = 'You have exceeded the maximum limit to resend the OTP. Please try after 1 hour';
			this.mservice.setMultiFormData(this.multiformdata)
			this.router.navigateByUrl("registration/five");
			return;
		}

		const phonenum = this.multiformdata.PhoneAreaCode + this.multiformdata.Phone
		const email = this.multiformdata.Email
		const firstname = this.multiformdata.FirstName
		this.mservice.sendSmsAndEmail(phonenum, email,firstname)
			.subscribe((data:any)=>{
				console.log(data)
				this.countdown.restart()
				this.resend_otp_count++;
				this.resend_otp_success = true;
			},
				(err) => {
					console.log(err);
					alert('OTP send failed');
					this.countdown.restart();
				})
	}

	onSubmitData(){
		this.otperror = false;
		this.multiformdata.SmsOtpCode = this.SmsOtpCode;
		const formdata:FormData = new FormData();
		for ( const key in this.multiformdata ) {
			if(key == "DateofBirth" || key == 'DocExpiryDate'){
				const dob = this.multiformdata[key]
				const formatted_date = dob.year+"-"+dob.month+"-"+dob.day+" 00:00:00.000";
				formdata.append(key,formatted_date)
			}else if(key == "ProfilePic"){
				const fileobj = this.dataURItoBlob(this.multiformdata.ProfilePicDisplay)
				const ext = this.mimetype.split("/")[1]
				const filename = "amircupprofile."+ext;
				formdata.append(key,fileobj,filename)
			}else if(key == "ProfilePicDisplay") {
				console.log("pass")
			}else{
				formdata.append(key, this.multiformdata[key]);
			}
		}
		console.log("!!!!!!!!!!!!!!!!!!!111")
		console.log(JSON.stringify(formdata))
		formdata.forEach((value,key) => {
			console.log(key+" "+value)
		});
		this.mservice.customerPortalRegister(formdata).subscribe((res:any) =>{
			console.log(res)
			this.multiformdata.response = res.status;
			this.multiformdata.trackingid = res.data.applicationNo;
			this.mservice.setMultiFormData(this.multiformdata)
			this.router.navigateByUrl("registration/five");
		},error =>{
			console.log(error.error.resultCode)
			if(error.error.resultCode == 25 || error.error.resultCode == 27){
				this.otperror = true
				this.otperror_count++;
        if(this.otperror_count >= 3) {
          this.multiformdata.response = 'otp_submit_maxed_out';
          this.multiformdata.errormsg = 'You have exceeded the maximum number of OTP attempts. Please try again after 1 hour.';
          this.mservice.setMultiFormData(this.multiformdata)
          this.router.navigateByUrl("registration/five");
        }
			}else{
				this.multiformdata.response = error.error.status;
				this.multiformdata.errormsg = error.error.message;
				this.mservice.setMultiFormData(this.multiformdata)
				this.router.navigateByUrl("registration/five");
			}
		})
	}

}
