import { Component, Inject, OnInit, Pipe, PipeTransform } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  Environment,
  FanIDConfig,
  PasswordValidator,
  CoreService,
} from '@fan-id/core';
import { AuthService } from 'libs/api/server/src/lib/services/auth.service';
import { Subscription, timer } from 'rxjs';

@Component({
  selector: 'fan-id-forgot-password-otp',
  templateUrl: './forgot-password-otp.component.html',
  styleUrls: ['./forgot-password-otp.component.scss'],
})
export class ForgotPasswordOtpComponent implements OnInit {
  resetForm: FormGroup;
  form: FormGroup;
  otpForm = this.fb.group({
    otp: ['', Validators.required],
  });
  passvisibility;
  isServiceCenter: boolean;
  showMessage: boolean = false;
  message: string = '';

  disableOtp = true;
  disableReset = false;
  disablePasswordChange = true;

  error_dialog_open = false;
  showCommonDialog = false;
  success_message: any;
  countDown: Subscription;
  initCounterValue = 180;
  counter = 180;
  tick = 1000;
  timer = '';
  error_message: any;
  resendOtpcounter = 0;
  submitOtpCounter = 0;
  resendLimit = 3;
  submitLimit = 3;
  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngOnDestroy() {
    this.countDown = null;
  }
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    @Inject(FanIDConfig) private config: Environment,
    private coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.isServiceCenter = this.config.application === 'ServiceCenter';

    this.resetForm = this.fb.group({
      email: ['', Validators.required],
    });
    this.form = new FormGroup(
      {
        otp: new FormControl(null, Validators.required),
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
  }
  editEmail() {
    this.disableOtp = true;
    this.disableReset = false;
    this.resendOtpcounter = 0;
    this.submitOtpCounter = 0;
    this.disablePasswordChange = true;
    this.form.patchValue({
      otp: '',
      newPassword: '',
      confirmPassword: '',
    });
  }

  resendOtp() {
    this.resendOtpcounter += 1;
    this.submitOtpCounter += 1;
    this.message = '';
    ('');
    this.showMessage = false;
    if (this.resetForm.valid) {
      const otpRequest: any = {
        sendTo: this.resetForm.value['email'],
        channel: this.isServiceCenter ? 2 : 8,
      };

      this.authService.sendForgotOtp(otpRequest).subscribe(
        (response: any) => {
          if (response) {
            this.disableOtp = false;
            this.disableReset = true;
            if (this.resendOtpcounter < this.resendLimit)
              this.counter = this.initCounterValue;
          }
        },
        (err) => {
          this.message = err?.error?.message || 'Something went wrong!';
          this.showMessage = true;
        }
      );
    }
  }

  sendOtp() {
    this.resendOtpcounter = 0;
    this.submitOtpCounter = 0;

    this.message = '';
    ('');
    this.showMessage = false;
    if (this.resetForm.valid) {
      const otpRequest: any = {
        sendTo: this.resetForm.value['email'],
        channel: this.isServiceCenter ? 2 : 8,
      };

      this.authService.sendForgotOtp(otpRequest).subscribe(
        (response: any) => {
          if (response) {
            this.disableOtp = true;
            this.disableReset = true;
            this.disablePasswordChange = false;
            this.counter = this.initCounterValue;

            this.countDown = timer(0, this.tick).subscribe(() => {
              if (this.counter > 0) --this.counter;
              const minutes: number = Math.floor(this.counter / 60);
              this.timer =
                ('00' + minutes).slice(-2) +
                ':' +
                ('00' + Math.floor(this.counter - minutes * 60)).slice(-2);
            });
          }
        },
        (err) => {
          this.message = err?.error?.message || 'Something went wrong!';
          this.showMessage = true;
        }
      );
    }
  }
  validateOtp() {
    if (this.otpForm.valid) {
      this.disablePasswordChange = false;
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

  setPassword() {
    this.submitOtpCounter += 1;
    this.error_message = '';
    const payload = {
      email: this.resetForm.value['email'],
      code: this.form.value['otp'],
      password: btoa(
        this.coreService.encryptLoginDetails(
          btoa(this.form.value['confirmPassword'])
        )
      ),
      channel: this.config.application === 'ServiceCenter' ? 2 : 8,
    };

    this.authService.postResetPassword(payload).subscribe(
      (response) => {
        this.success_message =
          response?.message || 'Password Changed Successfully';
        this.showCommonDialog = true;
      },
      (error: any) => {
        if (this.submitOtpCounter >= this.submitLimit) {
          this.error_dialog_open = true;

          this.error_message =
            'You have reached the maximum limit to enter the correct OTP, please try again after sometime';
        } else {
          this.error_dialog_open = true;
          this.error_message = error?.error?.message || 'Something went wrong!';
        }
      }
    );
  }

  redirectToLogin() {
    this.showCommonDialog = false;
    this.router.navigate(['/auth/login'], {});
  }
}
