import { CoreService, Environment, FanIDConfig, PasswordValidator } from '@fan-id/core'
import { Component, Inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService } from 'libs/api/server/src/lib/services/account.service';
import { ChangePassword } from 'libs/api/server/src/lib/models/account.model';
import { toJSDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-calendar';
@Component({
  selector: 'fan-id-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  passvisibility: boolean = false;
  confirmpassvisibility: boolean = false;
  currentpassvisibility:boolean = false;
  error_dialog_open = false;
  error_message = '';
  success_message ='';
  showCommonDialog:boolean = false;
  show_cancel_modal:boolean = false;
  form = new FormGroup(
    {
      userName: new FormControl(localStorage.getItem('userName')),
      currentPassword: new FormControl('', Validators.required),
      // newPassword : new FormControl('',Validators.compose([Validators.required])),
      newPassword: new FormControl(
        '',
        Validators.compose([
          Validators.required,
          PasswordValidator(/\d/, { hasNumber: true }),
          PasswordValidator(/[A-Z]/, { hasCapitalCase: true }),
          PasswordValidator(/[a-z]/, { hasSmallCase: true }),
          PasswordValidator(/[!@#$%^&*()_+\-=\[\]{};'`~:"\\|,.<>\/?]/, {    
            hasSpecialCharacters: true,
          }),
          PasswordValidator(/^.{8,}$/, { minLength: true }),
        ])
      ),
      confirmPassword: new FormControl(null, Validators.required),
    },
    { validators: this.checkPasswords }
  );

  constructor(public router: Router, private accountService: AccountService,@Inject(FanIDConfig) private config: Environment,private coreService:CoreService) {

  }

  checkPasswords(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    const oldPassword = group.get('currentPassword')?.value;
    if (confirmPassword === null || confirmPassword === '') {
      return null;
    } else {
      if(oldPassword === confirmPassword){
        if(oldPassword === password)
          return { samePass: true }
        else
          return  {notSame: true };
      }
      else if(password !== confirmPassword){
        return  {notSame: true };
      }
      else{
        return null
      }
    }
  }

  public onSubmit() {
    if(this.config.sso ===false)
    {

    const subObject:ChangePassword ={
      oldPassword:btoa(this.form.get('currentPassword').value),
      password:btoa(this.form.get('newPassword').value),
      confirmPassword:btoa(this.form.get('confirmPassword').value)
    }
    this.accountService.changePassword(subObject).subscribe(response => {
      this.success_message = response?.message || "Password Changed Successfully";
      this.form.reset();
      this.showCommonDialog = true;
    },
    err=>{
      if(err?.isUnAuthorized){
        this.error_message = 'Your current password is wrong';
      }
      else{
        this.error_message = err?.error?.message || 'Something went wrong!';
      }
      this.error_dialog_open = true
    });
  }
  else if(this.config.sso === true)
  {
    const payload={
      oldPassword:btoa(this.coreService.encryptLoginDetails(btoa(this.form.get('currentPassword').value))),
      password:btoa(this.coreService.encryptLoginDetails(btoa(this.form.get('newPassword').value))),
      channel:this.config.application==="ServiceCenter"?2:8
    }
    this.accountService.resetPasswordOtp(payload).subscribe(response => {
      this.success_message = response?.message || "Password Changed Successfully";
      this.form.reset();
      this.showCommonDialog = true;
    },
    err=>{
      if(err?.isUnAuthorized){
        this.error_message = 'Your current password is wrong';
      }
      else{
        this.error_message = err?.error?.message || 'Something went wrong!';
      }
      this.error_dialog_open = true
    });

  }
  }

  cancel(check = true) {
    this.show_cancel_modal = check;
    !check && this.redirectToDashboard()
  }

  redirectToDashboard() {
    this.router.navigate(['main', 'dashboard']);
  }

  closeCancelModal() {
    this.show_cancel_modal = false;
  }

  alert() {
    alert("plinggggggggg")
  }
}
