import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl,
  FormGroup,
  Validators, } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {  AuthService  } from '@fan-id/api/server';
import { CoreService, Environment, FanIDConfig, PasswordValidator } from '@fan-id/core'
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'fan-id-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RegisterComponent implements OnInit {


  isServiceCenter = false;
  update_error = null;
  show_update_success_modal = false;
  show_cancel_modal = false;
  show_confirmation_modal = false;
  dialCode:any;
  OrgphoneFlagcode:string;
  code ='';
  email ='';
  validateResponse:any
  passvisibility = false;
  confirmpassvisibility = false;
  dailingCodeList:any[];
  form: FormGroup;
  showInvalidError=false;
  showLoginError = '';
  showError: string;
  error_dialog_open=false;
  showCommonDialog=false;
  success_message: any;
  addReadOnlyStyle: boolean =false;;

  constructor(
    private authService:AuthService,
    private fb: FormBuilder,
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private route: ActivatedRoute,
    private coreService:CoreService,
    private cookieService: CookieService,
  ) {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
  }

  ngOnInit(): void {

    this.form = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['',[Validators.required]],
      phonecode: ['',[Validators.required]],
      organizationName: ['',[Validators.required]],
      phoneNumber:['',[Validators.required]],

      newPassword: [
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
      ],
      confirmPassword: new FormControl(null, Validators.required),
      check:['',[Validators.required]]
    },
    { validators: this.checkPasswords }
    );
    this.form.patchValue({ phoneNumber:  '77777777',
      phonecode: '168' });
    localStorage.removeItem('accessToken');
    this.code = this.route.snapshot.queryParamMap.get('code');
    this.authService.getDailingCodes({}).subscribe(response=>{
        if(response.resultCode===1)
      {
      this.dailingCodeList = response.dataList;
      }
      else{
      this.dailingCodeList=[]
      }

  });
    if (this.config.application === 'ServiceCenter') {
      this.isServiceCenter = true;
    }

    // validate invite link start
    const validateRequest = {
      'invitationEmailCode':this.code
    }

    this.authService.validateUserInvite(validateRequest).subscribe(response=>
      {
          this.validateResponse=response;
          if(this.validateResponse?.status==200){
            this.form.patchValue({ email: this.validateResponse?.email });
            if(this.validateResponse.orgFirstName != null && this.validateResponse.orgLastName != null)
            {
              this.form.patchValue({firstName: this.validateResponse?.orgFirstName,lastName: this.validateResponse?.orgLastName, });
              this.form.get('firstName').disable({ onlySelf: true });
              this.form.get('lastName').disable({ onlySelf: true });
              this.addReadOnlyStyle = true;

            }
            if(this.isServiceCenter)
            {
              this.form.patchValue({ organizationName:  '-' });

            }
            else{
              this.form.patchValue({ organizationName:  this.validateResponse?.organisationName });

            }
          }
        },err=>{
        this.showError = "SignUp.InvalidLink"
        this.showInvalidError=true;
      });
    //validate end
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
  signup(){
    const payload= {
      "invitationEmailCode":this.code,
      "firstName":this.validateResponse.orgFirstName != null ?this.validateResponse.orgFirstName: this.form.value['firstName'],
      "lastName": this.validateResponse.orgLastName != null?this.validateResponse.orgLastName:this.form.value['lastName'],
      "email": this.form.value['email'],
      "refDialingCode_Id":this.form.value['phonecode'],
      "mobilePhone": this.form.value['phoneNumber'],
      "password": btoa(this.coreService.encryptLoginDetails(btoa(this.form.value['newPassword']))),
      "isHayyaPolicy": this.form.value['check']

    }
    this.authService.signupUser(payload).subscribe(response=>{
      if(response.resultCode ==1)
      {
        if(this.isServiceCenter){
          this.showCommonDialog=true;
        }
        else{

      //do login
      if(response?.loginResponse != null)
      {
        const loginObject = response?.loginResponse;
        if (response) {
          this.coreService.setLoginObject(loginObject);
          localStorage.setItem('userName', loginObject.userName);
          localStorage.setItem('firstName',loginObject.firstName);
          localStorage.setItem('accessToken', this.coreService.encryptValue(JSON.stringify(loginObject.access_token)));
          localStorage.setItem('refreshToken', loginObject.refreshToken);
          localStorage.setItem('organizationId', loginObject.organizationId);
          localStorage.setItem('organizationCode',loginObject.organizationCode);
          localStorage.setItem('isVoucherGenerationEnabled',loginObject.isVoucherGenerationEnabled);
          if(!this.isServiceCenter){
            localStorage.setItem(
          'accessGroupName',
          loginObject.accessGroupName
          );
          localStorage.setItem(
            'organizationRegUserCategoryIdAndCode',
            JSON.stringify(loginObject.organizationRegUserCategoryIdAndCode)
          );
        }
          localStorage.setItem('brUserType',loginObject.brUserType);
          const profileImageUrl = this.authService.composeImageUrl(loginObject.profileImageUrl)
          localStorage.setItem('profileImageUrl',profileImageUrl);
          localStorage.setItem('userId',loginObject.userId);
          localStorage.removeItem('rememberMe');
          if(loginObject?.userModuleGroupType!=1){
            this.authService.getUserPermissions().subscribe(x=>{
          this.processUserRole(x,false);
        })
          }
          else{
            this.processUserRole(null,true);
          }
          this.cookieService.set('loggedIn', 'true');
          this.router.navigate(['/main/dashboard'], {});
        }
      }
      }

    }
      else{
        this.showLoginError = "Something Went wrong! try again later.";
      }

    },err=>{
      this.showLoginError = err?.error.message;
      console.log(err)
    });

  }

  processUserRole(roles,fullAccess){
    let userRoles={
      'fullAccess':fullAccess,
      'roles':[]
    }
    if(fullAccess){
      localStorage.setItem('PermissionList',JSON.stringify(userRoles));
    }
    interface RoleModel {
     create:boolean,
     update:boolean,
     read:boolean,
     delete:boolean,
     list:boolean,
     allow:boolean

    }
    if(!fullAccess){
      roles?.data?.forEach(element => {

        if(userRoles?.roles?.some(e=>e['key']===element?.moduleName)){

          userRoles?.roles?.forEach(e=>{
            if(e['key']===element?.moduleName){
              switch((element?.permission)){
                case 1:e.value.read= true;break;
                case 2:e.value.create= true;break;
                case 3:e.value.update= true;break;
                case 4:e.value.delete= true;break;
                case 5:e.value.allow= true;break;
                case 6:e.value.list= true;break;
              }
            }});
        }
        else{
          let newRole:RoleModel={
            create:false,
            update:false,
            read:false,
            delete:false,
            list:false,
            allow:false
          }
          switch((element?.permission)){
            case 1:newRole.read= true;break;
            case 2:newRole.create= true;break;
            case 3:newRole.update= true;break;
            case 4:newRole.delete= true;break;
            case 5:newRole.allow= true;break;
            case 6:newRole.list= true;break;

          }

          const r = {
            key : element.moduleName,
            value : newRole
          }
        userRoles.roles.push(r);
        }

      });
      this.processMenu(userRoles);
    }

  }
  processMenu(userRoles){
    let menuList=[
      {"NewCustomer":false},
      {"AllApplications":false},
      { "CardPickup":false},
      { "CardReplacement":false}
    ]
    if(!userRoles.fullAccess){
      menuList=[
        {"NewCustomer":false},
        {"AllApplications":true},
        { "CardPickup":false},
        { "CardReplacement":false}
      ]
    }
    localStorage.setItem('PermissionList',JSON.stringify(userRoles));

  }

  redirectToLogin(){
    this.showCommonDialog = false
    this.router.navigateByUrl("/auth/login");

  }
  cancel(){
    this.router.navigate(['/auth/login'], {});

  }

}

