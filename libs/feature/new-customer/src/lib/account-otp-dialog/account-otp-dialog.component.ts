import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { AccountService, ApplicantService, CustomerCardApplicationInsertRequest, TournamentType } from "@fan-id/api/server";
import { MenuService } from "@fan-id/core";
import { convertNgbDateToISO } from "@fan-id/shared/utils/date";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { CountdownComponent, CountdownEvent } from "ngx-countdown";
import { take } from "rxjs/operators";

const MAX_OTP_COUNT = 3;

@Component({
  selector: "fan-id-account-otp-dialog",
  templateUrl: "./account-otp-dialog.component.html",
  styleUrls: ["./account-otp-dialog.component.scss"],
})
export class AccountOtpDialogComponent implements OnInit {
  @ViewChild('ngOtpInput') ngOtpInputRef:any;//Get reference using ViewChild and the specified hash

  @Input() otpinputprocess: boolean;
  @Input() otpVerifyStatus: boolean;
  @Input() phoneNumber: string;
  @Input() register_error_message?: string;
  @Input() email?:string;
  @Input() firstName?:string;
  @Input() formValue?:any;
  @Output() closeThis = new EventEmitter();
  timerConfig: any;

  otpverified_successfully = false;
  otpLength = 0;
  emailotpLength = 0;
  application_tracking_number: string;
  public body: any;
  otp: string;
  emailOtp:string;
  eventTournamentType: TournamentType = 2;
  public multiformdata:any;
  resend_otp_enabled = false;
  resend_otp_count = 0;
  otp_send_error = false;
  show_otp_error = false;
  otp_submit_failed_count = 0;
  otp_submit_error = false;
  otp_submit_error_type: 'sms' | 'email';
  max_otp_count = MAX_OTP_COUNT;
  returnMaxresendError = false;

  @ViewChild('cd', { static: false }) private countdown: CountdownComponent;

  constructor(
    private accountService: AccountService,
    private menuService: MenuService,
    private applicantService: ApplicantService
  ) {}

  ngOnInit(): void {
    console.log("ffffff> ", this.formValue)
    this.eventTournamentType = parseInt(localStorage.getItem('eventType')) as TournamentType;
    this.otpverified_successfully = this.otpVerifyStatus;
    if (this.otpinputprocess === true) {
      this.body = {
        recipientPhone: this.phoneNumber,
        tournamentType: this.eventTournamentType
      };
      this.timerConfig = { leftTime: 120, format: "mm:ss", demand: true };
      this.resendOTP();
    }
    this.application_tracking_number = "AB1234KGG"; //dummy
  }

  close() {
    this.closeThis.emit('close');
  }

  onOtpChange(otp: any) {
    this.otp = otp;
    this.otpLength = otp.length;
  }
  onEmailOtpChange(otp:any){
    this.emailOtp = otp;
    this.emailotpLength = otp.length;
  }

  handleCountdown(e: CountdownEvent) {
    console.log("timer", e);
    if(e.action === 'done' && this.resend_otp_count <= MAX_OTP_COUNT) {
      this.resend_otp_enabled = true;
    }
  }

  resendOTP() {
    this.resend_otp_enabled = false;
    this.otp_send_error = false;
    this.show_otp_error = false;
    this.otp_submit_error = false;

    if(this.resend_otp_count >= MAX_OTP_COUNT) {
      this.otpverified_successfully = false;
          this.otpinputprocess = false;
          this.closeThis.emit("otpverifyfailed");
          return;
    }
    if(this.eventTournamentType === 2){
      this.accountService.sendSMSOtp(this.body)
      .pipe(take(1))
      .subscribe(() => {
        this.countdown.restart();
        this.countdown.begin();
        this.resend_otp_count++;
      },
      (err) => {
        console.log({otpsenderror: err});
        if(err?.error?.resultCode == 24 && this.resend_otp_count<MAX_OTP_COUNT){
          this.otpverified_successfully = false;
          this.otpinputprocess = false;
          this.closeThis.emit("otpverifyfailed");
          return;
        }
        else{
          this.returnMaxresendError =  false;
          this.otp_send_error = true;
          this.resend_otp_enabled = true;
        }
        this.countdown.stop();
        this.resend_otp_count++;
      });
    }
    else if(this.eventTournamentType === 1){
      this.body = {
        recipientPhone: this.phoneNumber,
        email:this.email,
        firstName:this.firstName,
        tournamentType: this.eventTournamentType
      };
      this.accountService.customerPortalSendSMSEMAILOtp(this.body).subscribe(() => {
        this.countdown.restart();
        this.countdown.begin();
        this.resend_otp_count = this.resend_otp_count + 1;
      },
      (err) => {
        console.log({otpsenderror: err});
        if(err?.error?.resultCode == 24 && this.resend_otp_count<MAX_OTP_COUNT){
          this.otpverified_successfully = false;
          this.otpinputprocess = false;
          this.closeThis.emit("otpverifyfailed");
          return;
        }
        else{
          this.returnMaxresendError =  false;
          this.otp_send_error = true;
          this.resend_otp_enabled = true;
        }
          this.resend_otp_count++;
          this.countdown.stop();
      });
    }
  }

  submit() {
    this.otp_submit_error = false;

    const submitBody = {
      recipientPhone: this.phoneNumber,
      smsOtpCode: this.otp,
      tournamentType: this.eventTournamentType
    };
    this.accountService.validateSMSOtp(submitBody).subscribe(
      () => {
        this.otpinputprocess = false;
        this.closeThis.emit("otpverified");
      },
      (err) => {
        console.log(err);
        this.otp_submit_failed_count++;
        this.ngOtpInputRef.setValue('');
        if(this.otp_submit_failed_count >= MAX_OTP_COUNT) {
          this.otpverified_successfully = false;
          this.otpinputprocess = false;
          this.closeThis.emit("otpverifyfailed");
          return;
        }
        this.otp_submit_error = true;
        this.resend_otp_enabled = true;
      }
    );
  }

  localSubmit(){
    this.otp_submit_error = false;
    this.otp_submit_error_type = null;

    this.register()
        .then((response) => {
          console.log({ response });
          this.otpinputprocess = false;
          this.closeThis.emit("registered");
        })
        .catch((err) => {
          this.ngOtpInputRef.setValue('');
          if(err?.error?.resultCode == 25 || err?.error?.resultCode == 27){
            this.otp_submit_error_type = 'sms';
            this.otp_submit_error = true;
            this.otp_submit_failed_count++;
            if(this.otp_submit_failed_count >= MAX_OTP_COUNT) {
              this.otpverified_successfully = false;
              this.otpinputprocess = false;
              this.closeThis.emit("otpverifyfailed");
              return;
            }
          }
          // else if(err?.error?.resultCode == 27){
          //   this.otp_submit_error_type = 'email';
          //   this.otp_submit_error = true;
          //   this.otp_submit_failed_count++;
          //   if(this.otp_submit_failed_count >= MAX_OTP_COUNT) {
          //     this.otpverified_successfully = false;
          //     this.otpinputprocess = false;
          //     this.closeThis.emit("otpverifyfailed");
          //     return;
          //   }
          // }
          else{
            this.otpverified_successfully = false;
            this.otpinputprocess = false;
            this.register_error_message =
            err?.error?.message || 'Something went wrong!';
            this.closeThis.emit(this.register_error_message);
          }
        });
  }

  goToHome() {
    this.closeThis.emit(this.otpverified_successfully);
  }

  register() {
    try {
      const formValue = this.formValue

      let applicationInsertBody: CustomerCardApplicationInsertRequest = formValue.reduce(
        (prev, curr) => {
          const formComposed = this.applicantService.composeApplicationInsertRequest(
            curr
          );
          return { ...prev, ...formComposed };
        },
        {}
      );

      // *TODO remove once liferay removes doc_back
      // const { DocImageFront } = applicationInsertBody;

      const { RefCurrentResidentCountry_Code } = applicationInsertBody;

      let { DateofBirth, DocExpiryDate } = applicationInsertBody;

      DateofBirth = convertNgbDateToISO(
        (DateofBirth as unknown) as NgbDateStruct
      );
      DocExpiryDate = convertNgbDateToISO(
        (DocExpiryDate as unknown) as NgbDateStruct
      );

      const Channel = 2;
      const EmailOtpCode = this.emailOtp
      const SmsOtpCode = this.otp

      const eventname = this.menuService.getSelectedEventCode();
      const RefRegServiceCenter_Code = this.menuService.getTerminalCode()

      const DocSubType = 'NORMAL';
      //  1 - for excel upload
      //  2- bulk registration manual registration
      //  3 - SC registration
      const SubmissionType = 3;

      // convert medical array to csv
      let { RefMedicalInformation_Id } = applicationInsertBody;
      RefMedicalInformation_Id =
        ((RefMedicalInformation_Id as unknown) as Array<number>)?.join() ?? ''

      applicationInsertBody = {
        ...applicationInsertBody,
        RefMedicalInformation_Id,
        DateofBirth,
        DocExpiryDate,
        Channel,
        RefEvent_Code: eventname,
        // DocQualityScore,
        // FaceIDScore,
        // BackgroundCheckStatus,
        // BioMatchId,
        DocSubType,
        SubmissionType,
        RefRegServiceCenter_Code,
        RefSerivceCenter_Code: RefRegServiceCenter_Code,
        RefCardDeliveryType_Code: 'DHC',
        // EmergencyContactOneFullName,
        // EmergencyContactOnePhoneAreaCode,
        // EmergencyContactOnePhone,
        // EmergencyContactTwoFullName,
        // EmergencyContactTwoPhoneAreaCode,
        // EmergencyContactTwoPhone,
        // *TODO remove once liferay removes doc_back
        // DocImageBack: DocImageFront,
        RefResidentCountry_Code: RefCurrentResidentCountry_Code,
        submitReasonType: 1,
        IsChildApplication: false,
        // ...(this.RefParentFanIdNo
        //   ? {
        //       RefParentFanIdNo: this.RefParentFanIdNo,
        //       IsChildApplication: true,
        //     }
        //   : { IsChildApplication: false }),
        EmailOtpCode,
        SmsOtpCode
      };

      return this.applicantService
        .CustomerPortalRegister(applicationInsertBody)
        .pipe(take(1))
        .toPromise();
    } catch (error) {
      console.log(error);
      return Promise.reject({ error: { message: 'Something went wrong!' } });
    }
  }
}
