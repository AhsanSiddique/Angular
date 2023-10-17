import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@fan-id/api/server';
import { ResponsiveService } from '@fan-id/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'fan-id-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit, OnDestroy, AfterViewInit {
  CPForm!: FormGroup;
  passvisibilitycup = false;
  passvisibilitynep = false;
  passvisibilitycop = false;

  successOrFailedMsg ='';
  successBool = false;
  failBool = false;

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

  private readonly unsubscribe$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService:AuthService,
    private router:Router,
    private responsiveService: ResponsiveService
  ) { }

  ngOnInit(): void {
    this.CPForm = this.fb.group({
      cup: ['',Validators.required],
      nep: ['',Validators.required],
      cop: ['',Validators.required]
    }
    , { validators: this.checkPasswords }
    );

    this.CPForm.valueChanges
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(() => {
      this.failBool = false;
      this.successBool = false;
    })

  }

  ngAfterViewInit() {
    this.responsiveService.screenWidth$
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(screenWidth => {
      this.password_check_desktop = screenWidth > 768;
    });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onNewPasswordChange(password: string) {
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

  get passwordValid() {
    return Object.values(this.password_tests).every(Boolean)
  }

  get passwordCheckVisible() {
    if(!this.password_check_desktop) {
      return this.password_focus && !!this.CPForm.controls.nep.value;
    }

    return !!this.CPForm.controls.nep.value;
  }

  checkPasswords(group: AbstractControl) {
    const password = group.get('nep')?.value;
    const confirmPassword = group.get('cop')?.value;
    const oldPassword = group.get('cup')?.value;
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

  onSubmit(){
    const submitData = {
      oldPassword:btoa(this.CPForm.get('cup')?.value),
      password:btoa(this.CPForm.get('nep')?.value),
      confirmPassword:btoa(this.CPForm.get('cop')?.value)
    }
    this.authService.customerPortalChangePassword(submitData).subscribe(data=>{
      // this.router.navigate(['main/dashboard'])
      this.successOrFailedMsg ="Password updated sucessfully";
      this.failBool = false;
      this.successBool = true;
      this.CPForm.reset({cup: '', nep: '', cop: ''}, { emitEvent: false });
    },
    err=>{
      this.successOrFailedMsg ="Your current password is wrong";
      this.successBool = false;
      this.failBool = true;
      console.log(err)
    })

  }

}
