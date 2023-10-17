import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {  OrganizationService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-manage-count',
  templateUrl: './manage-count.component.html',
  styleUrls: ['./manage-count.component.scss']
})
export class ManageCountComponent implements OnInit {

  @Input() organizationId;
  @Output() closeThis = new EventEmitter();
  @Output() _success = new EventEmitter();


  form!: FormGroup;
  showOrgError = '';
  disableRadio = true;
  
  accessGroup = localStorage.getItem('accessGroupName');
  populatedList: any = [];
  constructor(private orgService: OrganizationService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      maxNoOfVouchers: ['', [Validators.required]],
      maxNoOfApplicants: ['', [Validators.required]],
      newAccessType: [null, [Validators.required]],
    });
    this.form.patchValue({
      maxNoOfApplicants: this.organizationId?.maxApplicantCount,
      maxNoOfVouchers: this.organizationId?.maxVoucherCount,
      newAccessType: this.organizationId?.newAccessType
    })
  }

  editUser() {
    const payload = {
      userId: this.organizationId.userId,
      maxApplicantCount: this.form.get('maxNoOfApplicants')?.value,
      maxVoucherCount: this.form.get('maxNoOfVouchers')?.value,
      newAccessType: this.form.get('newAccessType')?.value,
    }
    this.orgService.editOrganizationUserAppCount(payload).subscribe(
      (response) => {
        if (response.status == '200') {
          this._success.emit();
        } else {
          this.showOrgError = response.message;
        }
      },
      (error) => {
        this.showOrgError = error?.error?.message;
      }
    );
  }

  incrDecr(event,type:string) {
    let count = 0;
    if(type==="voucher"){
      count = this.form.get("maxNoOfVouchers")?.value;
    }
    else if(type === "application"){
      count = this.form.get("maxNoOfApplicants")?.value;
    }
    if (count === null) {
      if (event == "+"){
        count = 1;
      }
      else return
    } else if (event == "+") {
      count = +count + 1;
    } else if (event == "-" && +count > 0) {
      count = +count - 1;
    }
    if(type==="voucher"){
      this.form.controls.maxNoOfVouchers.patchValue(count);
    }
    else if(type === "application"){
      this.form.controls.maxNoOfApplicants.patchValue(count);
    }
  }
}