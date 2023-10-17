import { Component, OnInit,AfterViewInit } from '@angular/core';
import { MuliformService  } from '@fan-id/api/server';
import {Router} from '@angular/router';
import {
	trigger,
	state,
	style,
	animate,
	transition,
} from '@angular/animations';
@Component({
	selector: '[fan-id-multi-form-step-three]',
	templateUrl: './multi-form-step-three.component.html',
	styleUrls: ['./multi-form-step-three.component.scss'],
	animations: [
		trigger('openClose', [
			// ...
			state('open', style({
				height: '!',
				opacity: 1,
			})),
			state('closed', style({
				height: '0px',
				opacity: 0,
			})),
			transition('open => closed', [
				animate('0.5s')
			]),
			transition('closed => open', [
				animate('0.5s')
			]),
		]),
	],
})
export class MultiFormStepThreeComponent implements OnInit, AfterViewInit {
	public multiformdata:any;
	public expiry_dateDisplay:string;
	public dob_dateDisplay:string;
	public otperror = false;
	public errormsg = '';
	public isOpenfirst = true;
	public isOpensecond = true;
	public isOpenthird = true;
	public isOpenfour = true;
	public isOpenfive = true;
	public mimetype:string;
	otp_max_try_bool = false;
	otp_max_try_msg:string = '';

	constructor(
		private mservice:MuliformService,
		private router:Router
	) { }

	ngOnInit(): void {
		this.getAllData()
		this.mservice.sidebaremitter.emit();
	}
	ngAfterViewInit() {
		// Hack: Scrolls to top of Page after page view initialized
		const top = document.querySelector('.header-section');
		top && top.scrollIntoView();
	}

	getAllData(){
		let data = this.mservice.getMultiFormData()
		if(data){
			this.multiformdata = data;
			const { DocExpiryDate,DateofBirth } = data;
			this.expiry_dateDisplay =  DocExpiryDate.day+"-"+DocExpiryDate.month+"-"+DocExpiryDate.year;
			this.dob_dateDisplay =  DateofBirth.day+"-"+DateofBirth.month+"-"+DateofBirth.year;
		}

	}
	verifyEmailandPhone(){
		if(this.multiformdata.isChild == 'true'){
			this.sendsmsandemailotp();
		}else{
			const data = {
				"type": "all",
				"email": this.multiformdata.Email,
				"phone": this.multiformdata.PhoneAreaCode+"-"+this.multiformdata.Phone,
				"documentNo": this.multiformdata.RefDocType_Id+"-"+this.multiformdata.DocumentIdNo,
				"eventcode": "AmirCup2021",
				"refNationality_Code": this.multiformdata.RefNationality_Code
			}
			this.mservice.verifyEmailandPhone(data).subscribe((resp:any) =>{
				if(resp.status == 200){
					this.sendsmsandemailotp();
				}
			},err=>{
				console.log(err);
				this.errormsg = err.error.message;
			})
		}
	}

	dataURItoBlob(dataURI:any) {
		// convert base64/URLEncoded data component to raw binary data held in a string
		let byteString;
		if (dataURI.split(',')[0].indexOf('base64') >= 0)
			byteString = atob(dataURI.split(',')[1]);
		else
			byteString = unescape(dataURI.split(',')[1]);

		// separate out the mime component
		const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
		this.mimetype = mimeString;

		// write the bytes of the string to a typed array
		const ia = new Uint8Array(byteString.length);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ia], {type:mimeString});
	}
	sendsmsandemailotp(){
		if(this.multiformdata.isChild == "true"){
			this.multiformdata.IsChildApplication = true
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
				this.multiformdata.response = error.error.status;
				this.multiformdata.errormsg = error.error.message;
				this.mservice.setMultiFormData(this.multiformdata)
				this.router.navigateByUrl("registration/five");
			})

		}else{
			const phonenum = this.multiformdata.PhoneAreaCode + this.multiformdata.Phone
			const email = this.multiformdata.Email;
			const firstname = this.multiformdata.FirstName;
			this.otp_max_try_bool = false
			this.mservice.sendSmsAndEmail(phonenum,email,firstname)
				.subscribe((data:any)=>{
					console.log(data)
					this.router.navigateByUrl("registration/four");
				},(err) => {
					console.log(err);
					if(err?.error?.resultCode == 24){
						this.otp_max_try_bool = true;
						this.otp_max_try_msg = err?.error?.message
						
					}
					this.otperror = true;
				})
		}

	}
	onClickAccordion(id){
		switch(id){
			case 1:
				this.isOpenfirst = !this.isOpenfirst
				break;
			case 2:
				this.isOpensecond = !this.isOpensecond;
				break;
			case 3:
				this.isOpenthird = !this.isOpenthird;
				break;
			case 4:
				this.isOpenfour = !this.isOpenfour;
				break;
			case 5:
				this.isOpenfive = !this.isOpenfive;
				break;
		}

	}
}
