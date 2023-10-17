import { filter } from 'rxjs/operators';
import { Component, Inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@fan-id/api/server';
import { CoreService, Environment, FanIDConfig } from '@fan-id/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { CookieService } from 'ngx-cookie-service';


@Component({
  selector: 'fan-id-organization-signup',
  templateUrl: './organization-signup.component.html',
  styleUrls: ['./organization-signup.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OrganizationSignupComponent implements OnInit {
  @ViewChild(NgSelectComponent) ngSelectComponentValues: NgSelectComponent;

  code = '';
  email = '';
  organizationName = '';

  isServiceCenter = false;
  update_error = null;
  show_update_success_modal = false;
  show_cancel_modal = false;
  show_confirmation_modal = false;
  dialCode: any;
  OrgphoneFlagcode: string;

  validateResponse: any;
  passvisibility = false;
  confirmpassvisibility = false;
  dailingCodeList: any[];
  form: FormGroup;
  selectForm: FormGroup;

  showInvalidError = false;
  showOrgError = '';
  showError: string;
  error_dialog_open = false;
  showCommonDialog = false;
  success_message: any;
  emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
  emailList: any[] =[];
  validateSuccess = false;
  selectedCompanies;
  companies: any[] = [];
  loading = false;
  public asyncErrorMessages = {
    IsNotaValidEmail: 'Enter a Valid Email ID',
    IsAdminEmail:'Please do not enter Organization Admin Email ID'
  };
    constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
  }
  ngOnInit(): void {
    //  localStorage.removeItem('accessToken');
    if (this.isServiceCenter) {
      this.router.navigate(['/auth/login']);
    }
    this.emailList = [];
    this.form = this.fb.group({
      contactName: ['', [Validators.required]],
      email: ['', [Validators.required]],
      phonecode: ['', [Validators.required]],
      organizationName: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
      focalEmail: [[], [Validators.required]],
      contactLastName:[[],[Validators.required]],
      country: [null, [Validators.required]],
      address:['',[Validators.required]]
    });
    this.selectForm = new FormGroup({
      focalEmails: new FormControl()
   });
    this.code = this.route.snapshot.queryParamMap.get('code');


    this.authService.getDailingCodes({}).subscribe((response) => {
      if (response.resultCode === 1) {
        this.dailingCodeList = response.dataList;
      } else {
        this.dailingCodeList = [];
      }
    });

    // validate invite link start
    const validateRequest = {
      code: this.code,
    };

    this.authService.validateOrganization(validateRequest).subscribe(
      (response) => {
        this.validateResponse = response;
        if (response.status == 200) {
          this.validateSuccess = true;
          this.form.patchValue({
            organizationName: response.organisationName,
            email: response.primaryContactEmail,
          });

        }
      },
      (err) => {
        this.showError = 'SignUp.InvalidLink';
        this.showInvalidError = true;
      }
    );
    //validate end
  }
  addEmailId() {
    const emailId = this.form.get('focalEmail').value;
    if (
      this.form.get('focalEmail').valid &&
      this.emailList.length < 10 &&
      !(emailId === '')
    ) {
      console.log(this.emailList.indexOf(emailId));

      if (this.emailList.indexOf(emailId) === -1) {
        this.emailList.push(emailId);
      }
      this.form.patchValue({
        focalEmail: '',
      });
    }
  }
  deleteEmail(item) {
    this.emailList.splice(this.emailList.indexOf(item), 1);
  }
  cancel() {
    this.router.navigate(['/auth/login'], {});
  }
  submitOrgInvitation() {
    const formValue = this.form.get('focalEmail').value;
    console.log(this.form.value)
    this.emailList =[];
    formValue.forEach(element => {
      this.emailList.push(element.value);
    });
    const payload = {
      code: this.code,
      ContactName: this.form.get('contactName').value,
      refPhoneNationality_Id: this.form.value['phonecode'],
      phoneNumber: this.form.get('phoneNumber').value,
      emails: this.emailList,
      "contactLastName": this.form.get('contactLastName').value,
      "address": this.form.get('address').value,
      "refCountry_Id":this.form.get('country').value,
    };
    this.authService.submitOrganization(payload).subscribe((response) => {
      if(response.status==200)
      {
        this.showCommonDialog=true;

      }
      else{
        this.showOrgError ="Something went wrong!"
      }
    },err=>{
      this.showOrgError = err?.error.message;
      console.log(err)
    });
  }
  redirectToLogin(){
    this.showCommonDialog = false
    this.router.navigateByUrl("/auth/login");

  }
  onKey(event){
    console.log(event);
  }
  addTagPromise(emailId,List) {
    // console.log(this.selectForm.get('focalEmails').value);
    if(this.emailList == null || this.emailList ===undefined){
      this.emailList=[]
    }
    console.log(this.emailList,this.emailList.length)

    if (
      this.emailList.length < 10 &&
      !(emailId === '')
    ) {

      if (this.emailList.indexOf(emailId) === -1) {
        this.emailList.push(emailId);
        this.form.patchValue(emailId);
    return emailId;

      }
    }
  }
  removeElement(email,List){
       console.log(this.form.get('focalEmail').value);

    console.log(this.emailList,List);
    const index= this.emailList.indexOf(email.value);
    this.emailList.splice(index,1);
    console.log(this.emailList,this.emailList.length)


  }
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public asyncValidators = [this.validateAsync,this.validateAdminMail];

  private validateAsync(control: FormControl): Promise<any> {
    return new Promise(resolve => {
      const value = control.value;
      const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      const validate = re.test(value);
      const result: any = !validate? {
        IsNotaValidEmail: true
      } : null;

      setTimeout(() => {
        resolve(result);
      }, 1);
    });
  }

   validateAdminMail( control: FormControl): Promise<any> {
console.log(control);
    return new Promise(resolve => {
      const email = $('#email').val();
      console.log(email);
      const value = control.value;
      const result: any = (value == email)? {
        IsAdminEmail: true
      } : null;

      setTimeout(() => {
        resolve(result);
      }, 1);
    });
  }
}
