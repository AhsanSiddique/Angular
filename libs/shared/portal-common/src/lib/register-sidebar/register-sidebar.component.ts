import { Component, OnInit } from '@angular/core';
import { MuliformService  } from '@fan-id/api/server';
import {Router} from '@angular/router';

@Component({
	selector: 'fan-id-register-sidebar',
	templateUrl: './register-sidebar.component.html',
	styleUrls: ['./register-sidebar.component.scss']
})
export class RegisterSidebarComponent implements OnInit {
	private url:string;
	public firstLinkStyle:string;
	public secondLinkStyle:string;
	public thirdLinkStyle:string;
	public fourthLinkStyle:string;
	public mformdata:any;

	public firstlinkused:boolean = false;
	public secondlinkused:boolean = false;
	public thirdlinkused:boolean = false;
	public fourthlinkused:boolean = false;
	public isinFifthPage = false;

	constructor(
		private mservice:MuliformService,
		private router:Router
	) {
			this.url = this.router.url;
	}

	ngOnInit(): void {
		this.mformdata = this.mservice.getMultiFormData()
		this.mservice.sidebaremitter.subscribe((data)=>{
			this.url = this.router.url;
			this.setCssClass()
			this.mformdata = this.mservice.getMultiFormData()
		});
	}

	setCssClass(){
		if(this.url == "/registration"){
			this.firstLinkStyle = "active";
			this.secondLinkStyle = this.thirdLinkStyle = this.fourthLinkStyle = '';
			this.firstlinkused = this.secondlinkused = this.thirdlinkused = this.fourthlinkused = false;
			this.isinFifthPage = false;
		}else if(this.url == '/registration/two'){
			this.secondLinkStyle = "active";
			this.firstLinkStyle = "used";
			this.thirdLinkStyle = this.fourthLinkStyle = '';
			this.firstlinkused  = true;
			this.secondlinkused = this.thirdlinkused = this.fourthlinkused = false;
			this.isinFifthPage = false;
		}else if(this.url == '/registration/three'){
			this.firstLinkStyle = "used";
			this.secondLinkStyle = "used";
			this.thirdLinkStyle = 'active'
			this.fourthLinkStyle = ''
			this.firstlinkused  = true;
			this.secondlinkused = true;
			this.thirdlinkused = this.fourthlinkused = false;
			this.isinFifthPage = false;
		}else if(this.url == '/registration/four'){
			this.firstLinkStyle = "used";
			this.secondLinkStyle = "used";
			this.thirdLinkStyle = 'used'
			this.fourthLinkStyle = 'active'
			this.firstlinkused  = true;
			this.secondlinkused = true;
			this.thirdlinkused = true;
			this.fourthlinkused = false;
			this.isinFifthPage = false;
		}else if(this.url == '/registration/five'){
			this.firstLinkStyle = "used nolink";
			this.secondLinkStyle = "used nolink";
			this.thirdLinkStyle = 'used nolink';
			this.fourthLinkStyle = 'used nolink';
			this.firstlinkused  = true;
			this.secondlinkused = true;
			this.thirdlinkused = true;
			this.fourthlinkused = true;
			this.isinFifthPage = true;
		}
	}
	onClickLink(id:number){
		switch(id){
			case 1:
				if (this.firstlinkused == true && this.isinFifthPage == false){
					this.router.navigateByUrl("/registration");
				}
				break;
			case 2:
				if(this.secondlinkused == true && this.isinFifthPage == false){
					this.router.navigateByUrl("/registration/two");
				}
				break;
			case 3:
				if(this.thirdlinkused == true && this.isinFifthPage == false){
					this.router.navigateByUrl("/registration/three");
				}
				break;
			case 4:
				if(this.fourthlinkused == true && this.isinFifthPage == false){
					this.router.navigateByUrl("/registration/four");
				}
		}
	}

}
