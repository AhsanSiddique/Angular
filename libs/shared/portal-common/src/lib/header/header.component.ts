import { AfterViewInit, Component,HostListener, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CoreService, EnvironmentPortal, FanIDConfig } from '@fan-id/core';
declare let $: any;
import { AuthService } from '@fan-id/api/server';
import { RECAPTCHA_SETTINGS, RecaptchaSettings, RecaptchaComponent } from "ng-recaptcha";
import { NgxSpinnerService } from 'ngx-spinner';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { take } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
@Component({
  selector: 'fan-id-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: { siteKey: "6Lf4U1YcAAAAAFOTEJu247uqhYN-WDZHpaTR-1G3" , secretKey:"6Lf4U1YcAAAAAK5hLkFiBsLicBtLrgFYBandBpPA"

    } as RecaptchaSettings,
    },
  ],
  animations:[
    trigger('fade',
    [
      state('void', style({ opacity : 0})),
      transition(':enter',[ animate(300)]),
      transition(':leave',[ animate(500)]),
    ]
)]

})
export class HeaderComponent implements OnInit,AfterViewInit {
  @Input() isHome=false;
  @ViewChild('closeSignInModal')
  closeSignInModal!: ElementRef;
  @ViewChild('hamModal')
  hamModal!: ElementRef;
  @ViewChild('createPasswordModal')
  createPasswordModal!: ElementRef;
  @ViewChild('toggleSigninModal')
  toggleSigninModal!: ElementRef;
  @ViewChild('signinCaptcha')
  signinCaptcha!: RecaptchaComponent;

  siteKey="6Lf4U1YcAAAAAFOTEJu247uqhYN-WDZHpaTR-1G3";
  loginForm!: FormGroup;
  passvisibility: boolean = false;
  forgotBoolean:boolean = false;
  failBool:boolean=false;
  sentMailFailBoolean:boolean = false;
  successOrFailedMsg:string ='';
  isLoggedIn:boolean=true;
  profileImg:string='/assets/images/default-profile.png';
  isCaptachaSuccess: boolean=false;
  code:string| null ='';
  profileImageUrl = '';

  createPasswordForm!: FormGroup;
  create_password_visible = false;
  confirm_password_visible = false;
  new_password_tests = {
    check_1: false,
    check_2: false,
    check_3: false,
    check_4: false,
    check_5: false,
    check_6: false
  };
  new_password_check_desktop = true;
  new_password_focus = false;
  isForgetCaptcha: boolean=false;

  success_error_body: {
    success: boolean,
    source: 'forgot-password' | 'create-new-password',
    message: string
  } | null = null;

  remember_me_checked = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private coreService: CoreService,
    private spinner: NgxSpinnerService,
    private route:ActivatedRoute,
    private cookieService: CookieService,
    @Inject(DOCUMENT) document,
     @Inject(FanIDConfig) private config: EnvironmentPortal) { }
  redirectionLinks={
    privacy:'/web/hcep/privacy-policy',
    terms:'/web/hcep/terms-of-use',
    cookie:'/web/hcep/cookie-policy'
  }

  ngAfterViewInit(): void {
    if(this.router.url.split('?')[0] ==='/reset-password'){
      this.code = this.route.snapshot.queryParamMap.get('Code')
      this.createPasswordModal.nativeElement.click();

      console.warn("this.code = this.route.snapshot.queryParamMap.get('Code')",this.code = this.route.snapshot.queryParamMap.get('Code'))
      // validate token
      if(this.code) {
        this.authService.customerPortalValidateResetPasswordCode(this.code)
        .pipe(take(1))
        .subscribe(response => {
          console.log(response)
        }, err => {
          console.log({err})
          this.success_error_body = {
            success: false,
            source: 'create-new-password',
            message: 'CreateNewPassword.LinkErrorMessage'
          }
        })
      } else {
        this.success_error_body = {
          success: false,
          source: 'create-new-password',
          message: 'CreateNewPassword.LinkErrorMessage'
        }
      }
    }
  }
  @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {
    if (window.pageYOffset>5) {
      let element = document.getElementById('navbar');
      element.classList.add('sticky');
    } else {
     let element = document.getElementById('navbar');
       element.classList.remove('sticky');
    }
 }

 scrollToExternalSite(url:string ){
  this.closeSignInModal.nativeElement.click();
  window.open(this.config.portalUrl+url, '_blank');
}
  ngOnInit(): void {
    this.profileImageUrl = localStorage.getItem('profileImageUrl') ?? '';
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });


    this.createPasswordForm = this.fb.group(
      {
        password: ['', Validators.required],
        confirm_password: ['', Validators.required],
      },
      { validators: this.checkPasswords }
    );
    this.coreService.isLoggedIn.subscribe((obj) => {
      this.isLoggedIn = obj;
    });
    if (JSON.parse(this.coreService.decryptValue(localStorage.getItem('accessToken'))))
    {
      this.isLoggedIn = true;
    }

  }
  resolved(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
    if(captchaResponse!=null)
    {
      this.isCaptachaSuccess=true;
    }
    else{
      this.isCaptachaSuccess=false;
    }
  }

  resolvedForget(captchaResponse: string) {
    console.log(`Resolved captcha with response: ${captchaResponse}`);
    if(captchaResponse!=null)
    {
      this.isForgetCaptcha=true;
    }
    else{
      this.isForgetCaptcha=false;
    }
  }
  placeholderClass() {
    if (this.loginForm.controls.username.value) return 'floating-label';
    else {
      return 'floating-label-pass';
    }
  }
  pswdPlaceholderClass() {
    if (this.loginForm.controls.password.value) {
      return 'password-floating-label';
    } else {
      return 'password-floating-label-pass';
    }
  }
  forgotPassBoolean() {
    this.forgotBoolean = !this.forgotBoolean;
    if (this.forgotBoolean) {
      this.signinCaptcha.reset();
      this.resetSigninForm();
      this.loginForm.clearValidators();
      this.loginForm.updateValueAndValidity();
      this.loginForm.get('username')?.setValidators([Validators.required]);
      this.loginForm.updateValueAndValidity();
    } else {
      this.loginForm.get('password')?.setValidators([Validators.required]);
      this.loginForm.updateValueAndValidity();
      // this.loginForm.get('password')?.patchValue('')
    }
    console.log('forgotBoolean> ', this.forgotBoolean);
  }
  SignIn() {
    // localStorage.setItem('accessToken', 'DB5417DBF38640AEB5FCE2A2C79E4CD60DCEE6BFE0094871A776B2B9824C8031');
    let data: any = {
      userName: this.loginForm.get('username')?.value,
      password: btoa(this.loginForm.get('password')?.value),
    };
    this.authService.customerPortalLogin(data).subscribe(
      (response) => {
        console.log(response);
        this.failBool = false;
        localStorage.setItem('accessToken', this.coreService.encryptValue(JSON.stringify(response.access_token)));
        localStorage.setItem('fanId', response.userFanIdNumber);
        if(this.remember_me_checked) {
          localStorage.setItem('rememberMe', 'true');
          localStorage.setItem('userName', response?.userName);
        }else{
          localStorage.removeItem('rememberMe');
          localStorage.removeItem('userName');
        }
        this.cookieService.set('loggedIn', 'true');
        this.profileImageUrl = this.authService.composeCustomerPortalImageUrl(
          response?.profileImageUrl
        );
        localStorage.setItem('profileImageUrl', this.profileImageUrl);
        this.closeSignInModal.nativeElement.click();
        this.reset()
        this.coreService.doLogin(response);
        this.router.navigate(['/main/dashboard']);
      },
      (err) => {
        this.successOrFailedMsg = 'Common.ErrorPassword';
        this.failBool = true;
        console.log(err);
      }
    );
  }
  reset(){
    this.loginForm.reset();
  }
  ForgotSubmit() {
    let data: any = {
      email: this.loginForm.get('username')?.value,
    };
    this.authService.customerPortalSendForgotEmail(data).subscribe(
      (response) => {
        this.successOrFailedMsg = 'We have sent you a password reset email';
        this.sentMailFailBoolean = true;
        this.success_error_body = {
          success: true,
          source: 'forgot-password',
          message: 'ForgotPassword.SuccessMessage'
        }
        console.log(response);
      },
      (err) => {
        this.successOrFailedMsg = '*Invalid email address';
        this.sentMailFailBoolean = true;
        this.success_error_body = {
          success: false,
          source: 'forgot-password',
          message: err?.error?.message ?? 'Something went wrong!'
        }
        console.log(err);
      }
    );
  }
  close() {
    this.hamModal.nativeElement.click();
  }
  closeSignIn() {
    this.closeSignInModal.nativeElement.click();
  }

  logout() {
    this.coreService.logout();
  }
  scrolltoContact(id: any) {
    // if(this.router.url.startsWith('/home')){
    let el = document.getElementById(id);
    const pos = el.style.position;
    const top = el.style.top;
    el.style.position = 'relative';
    el.style.top = '-200px';
    el.scrollIntoView({ block: 'start', behavior: 'smooth' });
    el.style.position = pos;
    el.style.top = top;
  // }
  //   else{
  //     this.router.navigateByUrl("/home?fragment=footer");
  //   }
  }

  closeAndRedirectToContactUs(closeElement: HTMLButtonElement) {
    this.spinner.show()
    closeElement.click();
    this.resetSigninModal();
    if(this.router.url.startsWith('/home')) {
      setTimeout(() => {
        this.scrolltoContact('footer');
        this.spinner.hide();
      }, 1000)
      return;
    }
    setTimeout(() => {
      this.router.navigateByUrl("/home?fragment=footer");
      this.spinner.hide();
      }, 1000)
  }

  //#region create-new-password
  checkPasswords: ValidatorFn = (
    group: AbstractControl
  ): ValidationErrors | null => {
    const pass = group.get('password')?.value;
    const confirmPass = group.get('confirm_password')?.value;
    return pass === confirmPass ? null : { passwordNotSame: true };
  };

  get cpf() {
    return this.createPasswordForm.controls;
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


    this.new_password_tests = {
      check_1,
      check_2,
      check_3,
      check_4,
      check_5,
      check_6
    }
  }

  onPasswordFocus() {
    this.new_password_focus = true;
  }

  onPasswordBlur() {
    this.new_password_focus = false;
  }

  get newPasswordValid() {
    return Object.values(this.new_password_tests).every(Boolean)
  }

  createNewPasswordSubmit() {
    const { password, confirm_password } = this.createPasswordForm.value;
    const body = {
      Code: this.code || '',
      Password: btoa(password),
      RePassword: btoa(confirm_password)
    }
    this.authService.customerPortalForgotPassword(body)
    .pipe(take(1))
    .subscribe(response => {
      console.log(response);
      this.success_error_body = {
        success: true,
        source: 'create-new-password',
        message: 'CreateNewPassword.SuccessMessage'
      }
    },
    err => {
      console.log(err);
      this.success_error_body = {
        success: false,
        source: 'create-new-password',
        message: err?.error?.message || 'Password Reset Failed'
      }
    })
  }
  //#endregion create-new-password

  scrolltoFooterMb(){
    this.close();
    this.scrolltoContact('footer');

  }

  redirectToSignIn(source: 'forgot-password' | 'create-new-password') {
    this.resetSigninModal()
    if(source === 'create-new-password'){
      this.createPasswordModal.nativeElement.click();
      this.toggleSigninModal.nativeElement.click();
    }
  }

  resetSigninModal() {
    this.remember_me_checked = false;
    this.signinCaptcha?.reset();
    this.success_error_body = null;
    this.forgotBoolean = false;
    this.isForgetCaptcha = false;
    this.isCaptachaSuccess = false;
    this.resetSigninForm();
  }

  resetSigninForm() {
    const rememberMe = localStorage.getItem('rememberMe');
    const username = localStorage.getItem('userName');
    if(rememberMe) {
      this.loginForm?.reset({ username })
    } else {
      this.loginForm?.reset();
    }
    if(this.loginForm) {
      for (const control in this.loginForm.controls) {
        this.loginForm.controls[control].setErrors(null)
      }
    }
    this.failBool = false;
  }
}
