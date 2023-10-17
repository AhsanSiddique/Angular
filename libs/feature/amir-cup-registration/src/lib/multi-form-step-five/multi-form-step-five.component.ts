import { Component, OnInit,OnDestroy} from '@angular/core';
import { MuliformService  } from '@fan-id/api/server';
import {Router} from '@angular/router';

@Component({
	selector: 'fan-id-multi-form-step-five',
	templateUrl: './multi-form-step-five.component.html',
	styleUrls: ['./multi-form-step-five.component.scss']
})
export class MultiFormStepFiveComponent implements OnInit {
	public multiformdata:any;
	public isGoToHomeClicked = false;
	public isGoToEdit = false;

	constructor(
		private mservice:MuliformService,
		private router:Router,
	) { }


	ngOnInit(): void {
		this.getAllData()
		this.mservice.sidebaremitter.emit();

	}
	ngOnDestroy():void{
		if(!this.isGoToHomeClicked && !this.isGoToEdit){
			this.goToHome();
		}
	}
	getAllData(){
		const data = this.mservice.getMultiFormData()
		if(data){
			this.multiformdata = data;
		}

	}
	goToHome(){
		this.isGoToHomeClicked = true;
		this.mservice.clearMultiFormData();
		this.router.navigate(['/home'], {replaceUrl: true});
	}
	goToEdit(){
		this.isGoToEdit = true;
		this.router.navigateByUrl("/registration");
	}

}
