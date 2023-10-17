import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService, BulkGroupService, MetadataService } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { first } from 'rxjs/operators';

@Component({
  selector: 'fan-id-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm = this.fb.group({
    userName: localStorage.getItem('userName'),
    firstName: ['', [Validators.required, Validators.pattern("[a-zA-ZÀ-ÿ ]*")]],
    lastName: ['', [Validators.required, Validators.pattern("[a-zA-ZÀ-ÿ ]*")]],
    email: [''],
    mobileNo: [''],
    phoneAreaCode: [''],
    phoneCountryCode: [''],
    organizationName: [''],
    organizationId:[''],
    organizationemail:[''],
    organizationphoneAreaCode:[''],
    organizationphoneNumber:[''],
    organizationAddress:[''],
  });

  isServiceCenter = false;
  update_error = null;
  show_update_success_modal = false;
  show_cancel_modal = false;
  show_confirmation_modal = false;
  dialCode:any;
  OrgphoneFlagcode:string;


  constructor(
    private accountService: AccountService,
    private fb: FormBuilder,
    private bulkGroupService:BulkGroupService,
    @Inject(FanIDConfig) private config: Environment,
    private router: Router,
    private metadataService: MetadataService
  ) {
    this.isServiceCenter = this.config.application === 'ServiceCenter';
  }

  ngOnInit(): void {
    this.getProfileData()
      .pipe(first())
      .subscribe((response) => {
        const data = response?.data;
        this.setProfileFormValue(data);
      });
      if(!this.isServiceCenter){
        this.bulkGroupService.getOrganization(parseInt(localStorage.getItem('organizationId'))).subscribe(data=>{
          const address = data?.data?.addressLine1+'\n'+data?.data?.addressLine2+'\n'

          this.profileForm.patchValue({
            organizationId: data?.data?.organizationId,
            organizationemail: data?.data?.email,
            organizationphoneAreaCode: data?.data?.phoneAreaCode,
            organizationphoneNumber: data?.data?.phoneNumber,
            organizationAddress: address,
          });
          this.metadataService.getDialingCodes().subscribe(codes=>{
            codes.forEach(item=>{
              if(item.dialingCode === data?.data?.phoneAreaCode){
                this.OrgphoneFlagcode = item.code
              }
            })
          });
        })
      }

  }

  setProfileFormValue(data) {
    this.profileForm.patchValue({
      firstName: data?.firstName,
    });
    this.profileForm.patchValue({ lastName: data?.lastName });
    this.profileForm.patchValue({ email: data?.email });
    this.profileForm.patchValue({ mobileNo: data?.phone });
    this.profileForm.patchValue({
      organizationName: data?.organizationName,
    });
    this.profileForm.patchValue({ phoneAreaCode: data?.phoneAreaCode });
    this.profileForm.patchValue({ phoneCountryCode: data?.phoneCountryCode });
  }

  getProfileData() {
    if (this.isServiceCenter) return this.accountService.getProfileDataSC();
    return this.accountService.getProfileDataBR();
  }

  get pf() {
    return this.profileForm.controls;
  }

  get firstName() {
    return this.pf.firstName;
  }

  get lastName() {
    return this.pf.lastName;
  }

  get phoneAreaCode() {
    return this.pf.phoneAreaCode;
  }

  get phoneCountryCode() {
    return this.pf.phoneCountryCode;
  }

  get editValid() {
    const fieldsValid = this.firstName.valid && this.lastName.valid;
    const fieldsDirty = this.firstName.dirty || this.lastName.dirty;
    return fieldsValid && fieldsDirty;
  }

  onSubmit() {
    const [firstName, lastName] = [this.firstName.value, this.lastName.value];
    this.accountService
    .updateProfile({ firstName, lastName })
    .pipe(first())
    .subscribe((response: any) => {
          console.log({ response });
          this.show_update_success_modal = true;
        },
        err => {
          this.update_error = err?.error?.message || 'Something went wrong!'
        });
  }

  closeUpdateError() {
    this.update_error = null;
  }

  redirectToDashboard() {
    this.router.navigate(['main', 'dashboard']);
  }

  cancel(check = true) {
    this.show_cancel_modal = check;
    !check && this.redirectToDashboard()
  }

  closeCancelModal() {
    this.show_cancel_modal = false;
  }

  showConfirmModal() {
    this.show_confirmation_modal = true
  }

  closeConfirmModal() {
    this.show_confirmation_modal = false;
    this.onSubmit()
  }

  closeSuccessModal() {
    this.show_update_success_modal = false;
    this.firstName.markAsPristine({onlySelf: true})
    this.lastName.markAsPristine({onlySelf: true})
  }
}
