import { Component, Inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Environment, FanIDConfig, PasswordValidator } from '@fan-id/core'
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  passvisibility: boolean = false;
  confirmpassvisibility:boolean = false;
  code:string ='';
  error_dialog_open = false;
  error_message = '';
  isServiceCenter: boolean = false;

  form = new FormGroup(
    {
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

  constructor(private route: ActivatedRoute,
    public router: Router,
    private accountService:AccountService,
    @Inject(FanIDConfig) private config: Environment) {}

  ngOnInit(): void {
    localStorage.removeItem('accessToken');
    this.code = this.route.snapshot.queryParamMap.get('Code');
    if (this.config.application === 'ServiceCenter') {
      this.isServiceCenter = true;
    }
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('newPassword').value;
    const confirmPassword = group.get('confirmPassword').value;
    if (confirmPassword === null || confirmPassword === '') {
      // Empty on purpose
    } else {
      return password === confirmPassword ? null : { notSame: true };
    }
  }
  setPassword(){
    let SaveReqobj: any =
    {
      channel:(this.isServiceCenter)?2:8, // 2 for Service Center and 8 for Bulk Registration
      code:this.code,
      password: btoa(this.form.get('newPassword').value),
      rePassword:btoa(this.form.get('confirmPassword').value)
    }
    this.accountService.forgotPassword(SaveReqobj).subscribe(response=>{
      this.router.navigate(['auth/login'])
    },err=>{
      this.error_message = err?.error?.message || "Something went wrong!";
      this.error_dialog_open = true
    })
  }
}
