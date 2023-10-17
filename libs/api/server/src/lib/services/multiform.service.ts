import { Inject,Injectable,EventEmitter } from '@angular/core';
import { HttpClient,HttpHeaders } from '@angular/common/http';
import { ApiUrls } from '../amir-cup-urls';
import { Environment, FanIDConfig } from '@fan-id/core';

@Injectable({
	providedIn: 'root'
})
export class MuliformService {
	private apiUrl: string;
	private baseUrl: string;
	private access_token = "DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031"

	constructor(
		@Inject(FanIDConfig) private config: Environment,
		private http: HttpClient
	) {
		this.baseUrl = this.config.mockUrl;
		this.apiUrl = this.config.apiUrl;
	}
	public sidebaremitter:EventEmitter<any> = new EventEmitter();

	setMultiFormData(data){
		localStorage.setItem('multiformdata',JSON.stringify(data))
	}
	getMultiFormData(){
		const multiformdata = localStorage.getItem('multiformdata');
		return JSON.parse(multiformdata)
	}
	clearMultiFormData(){
		localStorage.removeItem("multiformdata");
	}

	getNationalities(){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		);
		const url = `${this.apiUrl}` + ApiUrls.GetNationalities;
		return this.http.post(url,{},{headers:headers})
	}
	customerPortalRegister(data:FormData){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		).set('Content-Type','multipart/form-data');
		const url = `${this.apiUrl}` + ApiUrls.CustomerPortalRegister;
		return this.http.post(url,data,{headers:headers})

	}
	verifyTicketDetails(ticketid:number){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		).set('Content-Type','application/json');
		const url = `${this.apiUrl}` + ApiUrls.ValidateTicketNumber+ticketid;
		return this.http.get(url,{headers:headers})
	}
	sendSmsAndEmail(phone,email,firstname){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		).set('Content-Type','application/json');
		const data = {"RecipientPhone":phone,"Email":email,"FirstName":firstname}
		const url = `${this.apiUrl}` + ApiUrls.SendSmsAndEmailOtp;
		return this.http.post(url,data,{headers:headers})
	}
	verifyEmailandPhone(data:any){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		).set('Content-Type','application/json');
		const url = `${this.apiUrl}` + ApiUrls.verifyEmailandPhone;
		return this.http.post(url,data,{headers:headers})

	}
	validatePersonalDetails(data:any){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		).set('Content-Type','application/json');
		const url = `${this.apiUrl}` + ApiUrls.ValidatePersonalDetails;
		return this.http.post(url,data,{headers:headers})
	}
	validateApplicationDetails(data:any){
		const headers = new HttpHeaders().set(
			'Authorization',
			'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031'
		).set('Content-Type','application/json');
		const url = `${this.apiUrl}` + ApiUrls.ValidateApplicationDetails;
		return this.http.post(url,data,{headers:headers})
	}

}
