import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { Router } from '@angular/router';
import { Environment, FanIDConfig } from '@fan-id/core';
import { AuthService } from 'libs/api/server/src/lib/services/auth.service';

@Component({
  selector: 'fan-id-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  resetForm:FormGroup;
  passvisibility
  isServiceCenter:boolean;
  showMessage:boolean= false;
  message:string ='';
  disableSubmit:boolean = false;
  cancelOrClose:boolean = false;

  constructor(private router: Router, private fb:FormBuilder, private authService:AuthService,
    @Inject(FanIDConfig) private config: Environment) { }

  ngOnInit(): void {
    this.isServiceCenter = this.config.application === 'ServiceCenter';

    this.resetForm = this.fb.group({
      email: ['',Validators.required],
      username: ['',Validators.required]
    })
  }
  reset() {
    // original login code
    // this.authService.doLogin();
    if(this.resetForm.valid){
      const SaveReqobj: any =
      {
        channel:this.isServiceCenter ? 2 : 8,
        email: this.resetForm.get('email').value,
        SystemUserName: this.resetForm.get('username').value
      }
      this.authService.sendForgotEmail(SaveReqobj).subscribe((response: any) => {
       if(response){
         this.message = response?.message;
         this.showMessage = true;
         this.disableSubmit = true;
         this.cancelOrClose = true;
       }
      },err=>{
        this.message = err?.error?.message || "Something went wrong!";
         this.showMessage = true;
      });

    }
  }
}
