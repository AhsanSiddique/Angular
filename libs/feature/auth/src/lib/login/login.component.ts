import { HttpBackend, HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'libs/api/server/src/lib/services/auth.service';
import { Login } from 'libs/api/server/src/lib/models/auth.model';
import {
  Environment,
  FanIDConfig,
  LanguageService,
  CoreService,
} from '@fan-id/core';
import { CookieService } from 'ngx-cookie-service';
import { Subscription, timer } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'fan-id-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  passvisibility;
  langData: any[];
  selectedLang: any;
  isRTLLayout: boolean;
  terminalList: any[] = [];
  printerList: any[] = [];
  selectedTerminal: any;
  isServiceCenter: boolean = false;
  showError: string = '';
  remember_me_checked = false;
  showPrinter = false;
  dailingCodeList: any[];
  disableOtp = false;
  otpForm = this.fb.group({
    otp: ['', Validators.required],
  });
  countDown: Subscription;
  initCounterValue = 180;
  counter = 180;
  tick = 1000;
  timer = '';
  ipAddress: string;
  loginTempObject: any;
  resendOtpcounter = 0;
  submitOtpCounter = 0;
  resendLimit = 3;
  submitLimit = 3;
  private httpClient: HttpClient;
  constructor(
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private languageService: LanguageService,
    private coreService: CoreService,
    private cookieService: CookieService,
    private httpBackend: HttpBackend,
    private spinner: NgxSpinnerService,
  ) {
    this.httpClient = new HttpClient(httpBackend);
  }
  getIp2() {
    this.httpClient.get('https://www.geolocation-db.com/json/').subscribe(
      (resp) => {
        this.ipAddress = resp['IPv4'];
      },
      (err) => {
        this.ipAddress = '127.0.0.1';
      }
    );
  }

  getIp1() {
    this.httpClient.get('https://api.ipify.org?format=json').subscribe(
      (response) => {
        this.ipAddress = response['ip'];
      },
      (err) => {
        this.getIp2();
      }
    );
  }
  getIpAddress(){
    this.httpClient.get('https://ipapi.co/json/?key='+this.config.ipKey).subscribe(
      (response) => {
        this.ipAddress = response['ip'];
      },
      (err) => {
        this.getIp1();
      }
    );
  }
  ngOnInit(): void {
    this.getIpAddress();

    localStorage.removeItem('event');
    const rememberMe = localStorage.getItem('rememberMe');
    const storedusername = localStorage.getItem('userName');
    this.countDown = timer(0, this.tick).subscribe(() => {
      if (this.counter > 0) --this.counter;
      const minutes: number = Math.floor(this.counter / 60);
      this.timer =
        ('00' + minutes).slice(-2) +
        ':' +
        ('00' + Math.floor(this.counter - minutes * 60)).slice(-2);
    });
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
      terminal: [null],
      printer: [null],
    });
    if (rememberMe) {
      this.loginForm.patchValue({ username: storedusername });
      // get('username').
    }
    this.languageService.layout.subscribe((isRTL) => {
      this.isRTLLayout = isRTL;
    });
    if (this.config.application === 'ServiceCenter') {
      this.isServiceCenter = true;
      const payload = {};
      this.authService.getTerminalList(payload).subscribe((response) => {
        if (response.resultCode === 1) {
          this.terminalList = response.dataList.filter(
            (x) => (x.isEnabled === true && x.code == 'SPC')
          );
          this.loginForm.patchValue({terminal : this.terminalList.find(x => x.code === 'SPC').id});
          this.loginForm.controls['terminal'].disable();

        } else {
          this.terminalList = [];
        }
      });
    }
  }

  changeTerminal() {
    const payload = {
      terminal_Id: this.isServiceCenter ? this.loginForm.value['terminal'] : '',
    };
    if (this.showPrinter)
      this.authService.getPrinterList(payload).subscribe((response) => {
        if (response.resultCode === 1) {
          this.printerList = response.data;
        } else {
          this.printerList = [];
        }
      });
  }
  proceedToOtp() {
    //   this.disableOtp=true
    this.showError = '';
    if (this.loginForm.valid) {
      if (this.isServiceCenter) {
        let payload: any = {
          ip: btoa(this.coreService.encryptLoginDetails(this.ipAddress)),
          userName: this.loginForm.value['username'],
          password: btoa(
            this.coreService.encryptLoginDetails(
              btoa(this.loginForm.value['password'])
            )
          ),
          terminalId: this.isServiceCenter
            ? this.terminalList.find(x => x.code === 'SPC').id
            : '',
        };
        if (this.isServiceCenter) {
          const selectedTerminal = this.terminalList.find(x => x.code === 'SPC');
          this.coreService.setTerminal(selectedTerminal);
          localStorage.setItem('Terminal', JSON.stringify(selectedTerminal));

          if (this.showPrinter) {
            const selectedPrinter = this.printerList.find(
              (e) => e.printer_Id === this.loginForm.value.printer
            );
            this.coreService.setPrinter(selectedPrinter);
            localStorage.setItem('Printer', JSON.stringify(selectedPrinter));
          } else {
            // localStorage.setItem(
            //   'Printer',
            //   JSON.stringify({ PrinterName: '', PrinterId: '' })
            // );
          }
        }
        this.authService.loginServiceCenter(payload).subscribe(
          (response) => {
            if (response.status == 200) {
              this.loginTempObject = response;
              if(this.loginTempObject.isDeveloper === true)
              {
                this.ProcessLoginResponse(this.loginTempObject);
              }
              else{
                this.counter = this.initCounterValue;
                this.disableOtp = true;
                this.resendOtpcounter = 0;
                this.submitOtpCounter = 0;
                localStorage.removeItem('accessToken');
                localStorage.setItem(
                  'idToken',
                  this.coreService.encryptValue(JSON.stringify(response.id_token))
                );
              }

            } else {
              this.showError =
                response?.error?.message || 'Something went wrong!';
            }
          },
          (error: any) => {
            this.showError = error?.error?.message || 'Something went wrong!';
          }
        );
      } else {
        let payload: any = {
          ip: btoa(this.coreService.encryptLoginDetails(this.ipAddress)),
          userName: this.loginForm.value['username'],
          password: btoa(
            this.coreService.encryptLoginDetails(
              btoa(this.loginForm.value['password'])
            )
          ),
        };
        this.authService.loginBulkRegister(payload).subscribe(
          (response) => {
            if (response.status == 200) {
              this.loginTempObject = response;
              if(this.loginTempObject.isDeveloper === true)
              {
                this.ProcessLoginResponse(this.loginTempObject);
              }
              else{
                 this.counter = this.initCounterValue;
              this.disableOtp = true;
              this.resendOtpcounter = 0;
              this.submitOtpCounter = 0;
              localStorage.removeItem('accessToken');
              localStorage.setItem(
                'idToken',
                this.coreService.encryptValue(JSON.stringify(response.id_token))
              );
              }

            } else {
              this.showError =
                response?.error?.message || 'Something went wrong!';
            }
          },
          (error: any) => {
            this.showError = error?.error?.message || 'Something went wrong!';
          }
        );
      }
    }
  }
  ProcessLoginResponse(response){
    localStorage.removeItem('idToken');
    this.loginTempObject['access_token'] = response.access_token;
    this.loginTempObject['refresh_token'] = response.refreshToken;
    this.coreService.setLoginObject(response);
    localStorage.setItem('firstName', this.loginTempObject.firstName);
    localStorage.setItem('userName', this.loginTempObject.userName);
    localStorage.setItem(
      'accessToken',
      this.coreService.encryptValue(
        JSON.stringify(response.access_token)
      )
    );
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem(
      'organizationId',
      this.loginTempObject.organizationId
    );
    localStorage.setItem(
      'organizationCode',
      this.loginTempObject.organizationCode
    );

    if (!this.isServiceCenter) {
      localStorage.setItem(
        'accessGroupName',
        this.loginTempObject.accessGroupName
      );

      localStorage.setItem(
        'organizationRegUserCategoryIdAndCode',
        JSON.stringify(this.loginTempObject.organizationRegUserCategoryIdAndCode)
      );

      localStorage.setItem(
        'organizationCustomerCategoryIdAndCode',
        JSON.stringify(this.loginTempObject.organizationCustomerCategoryIdAndCode ?? [])
      );

      localStorage.setItem(
        'organizationConferenceEventIdAndCode',
        JSON.stringify(this.loginTempObject.organizationConferenceEventIdAndCode ?? [])
      );
    }

    localStorage.setItem(
      'isVoucherGenerationEnabled',
      this.loginTempObject.isVoucherGenerationEnabled
    );
    localStorage.setItem('brUserType', this.loginTempObject.brUserType);
    const profileImageUrl = this.authService.composeImageUrl(
      this.loginTempObject.profileImageUrl
    );
    localStorage.setItem('profileImageUrl', profileImageUrl);
    localStorage.setItem('userId', this.loginTempObject.userId);
    if (this.remember_me_checked) {
      localStorage.setItem('rememberMe', 'true');
    } else {
      localStorage.removeItem('rememberMe');
    }
    if (this.loginTempObject?.userModuleGroupType != 1) {
      this.authService.getUserPermissions().subscribe((x) => {
        this.processUserRole(x, false);
      });
    } else {
      this.processUserRole(null, true);
    }
    this.cookieService.set('loggedIn', 'true');
    this.router.navigate(['/main/dashboard'], {});
  }
  login() {
    this.spinner.show();
    this.submitOtpCounter += 1;
    this.showError = '';
    if (this.otpForm.valid) {
      const payload = {
        // "idToken": this.loginTempObject.id_token,
        otp: this.otpForm.value['otp'],
      };
      this.authService.getAccessToken(payload).subscribe(
        (response) => {
          if (response.status == 200) {
            this.ProcessLoginResponse(response);
          } else {
            this.showError =
              response?.error?.message || 'Something went wrong!';
              this.spinner.hide();

          }
        },
        (error: any) => {
          this.spinner.hide();

          if(this.submitOtpCounter >= this.submitLimit)
          {
            this.showError ="You have reached the maximum limit to enter the correct OTP, please try again after sometime";
          }
          else{
            console.log('error', error);
            this.showError = error?.error?.message || 'Something went wrong!';
          }

        }
      );
    }
    //   if (this.loginForm.valid) {
    //   this.showError=false;

    //   let payload:Login={
    //     "channel":(this.isServiceCenter)?2:8, // 2 for Service Center and 8 for Bulk Registration
    //     "userName":this.loginForm.value['username'],
    //     "password":btoa(this.loginForm.value['password']),
    //     "terminalId" : (this.isServiceCenter)?this.loginForm.value['terminal']:""
    // }
    //   if (this.isServiceCenter) {
    //     const selectedTerminal = this.terminalList.find(
    //       (x) => x.id === this.loginForm.value.terminal
    //     );
    //     this.coreService.setTerminal(selectedTerminal);
    //     localStorage.setItem('Terminal', JSON.stringify(selectedTerminal));

    //     if(this.showPrinter)
    //     {
    //     const selectedPrinter = this.printerList.find(e=>e.printer_Id === this.loginForm.value.printer);
    //     this.coreService.setPrinter(selectedPrinter);
    //     localStorage.setItem('Printer',JSON.stringify(selectedPrinter));
    //     }
    //     else{
    //   localStorage.setItem('Printer',JSON.stringify({PrinterName:'',PrinterId:''}));

    //     }
    //   }
    //     this.authService
    //       .login(payload)
    //       .subscribe((response: any) => {
    //         if (response) {
    //
    //
    //         }
    //       },(error:any)=>{
    //         this.showError=true;
    //       });
    //   }
  }

  editEmail() {
    this.disableOtp = false;
    this.resendOtpcounter=0;
    this.submitOtpCounter=0;
    this.showError = '';
    this.otpForm.patchValue({
      otp: '',
    });
  }
  cancelOtp() {
    this.showError = '';
    this.disableOtp = false;
    this.otpForm.patchValue({
      otp: '',
    });
    this.loginForm.reset();
  }
  changeLanguage(obj) {
    this.languageService.setLanguage(obj);
    this.selectedLang = this.languageService.getSelectedLanguage();
  }
  processUserRole(roles, fullAccess) {
    let userRoles = {
      fullAccess: fullAccess,
      roles: [],
    };
    if (fullAccess) {
      localStorage.setItem('PermissionList', JSON.stringify(userRoles));
    }
    interface RoleModel {
      create: boolean;
      update: boolean;
      read: boolean;
      delete: boolean;
      list: boolean;
      allow: boolean;
    }
    if (!fullAccess) {
      roles?.data?.forEach((element) => {
        if (userRoles?.roles?.some((e) => e['key'] === element?.moduleName)) {
          userRoles?.roles?.forEach((e) => {
            if (e['key'] === element?.moduleName) {
              switch (element?.permission) {
                case 1:
                  e.value.read = true;
                  break;
                case 2:
                  e.value.create = true;
                  break;

                case 3:
                  e.value.update = true;
                  break;

                case 4:
                  e.value.delete = true;
                  break;

                case 5:
                  e.value.allow = true;
                  break;
                case 6:
                  e.value.list = true;
                  break;
              }
            }
          });
        } else {
          let newRole: RoleModel = {
            create: false,
            update: false,
            read: false,
            delete: false,
            list: false,
            allow: false,
          };
          switch (element?.permission) {
            case 1:
              newRole.read = true;
              break;
            case 2:
              newRole.create = true;
              break;

            case 3:
              newRole.update = true;
              break;

            case 4:
              newRole.delete = true;
              break;

            case 5:
              newRole.allow = true;
              break;
            case 6:
              newRole.list = true;
              break;
          }

          const r = {
            key: element.moduleName,
            value: newRole,
          };
          userRoles.roles.push(r);
        }
      });
      this.processMenu(userRoles);
    }
  }
  processMenu(userRoles) {
    let menuList = [
      { NewCustomer: false },
      { AllApplications: false },
      { CardPickup: false },
      { CardReplacement: false },
    ];
    if (!userRoles.fullAccess) {
      menuList = [
        { NewCustomer: false },
        { AllApplications: true },
        { CardPickup: false },
        { CardReplacement: false },
      ];
    }
    localStorage.setItem('PermissionList', JSON.stringify(userRoles));
    this.spinner.hide();

  }

  resendOtp() {
    this.showError = '';
    this.resendOtpcounter += 1;
    const payload = {
      // "idToken": this.loginTempObject.id_token,
    };
    this.authService.resendLoginOtp(payload).subscribe(
      (response) => {
        if (this.resendOtpcounter < this.resendLimit)
          this.counter = this.initCounterValue;
      },
      (err) => {
        this.showError = err?.error?.message || 'Something went wrong!';
      }
    );
  }
}
