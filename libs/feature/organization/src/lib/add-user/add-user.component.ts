import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {  OrganizationService } from '@fan-id/api/server';

@Component({
  selector: 'fan-id-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  @Input() organizationId = -1;
  @Output() closeThis = new EventEmitter();
  @Output() _success = new EventEmitter();


  form!: FormGroup;
  showOrgError = '';
  disableRadio = true;
  userList = [
    {
      name: "Super Admin",
      id: "3"
    },
    {
      name: "Organization Admin",
      id: "2"
    },
    {
      name: "Organization Representative",
      id: "1"
    }
  ]
  accessGroup = localStorage.getItem('accessGroupName');
  populatedList: any = [];
  constructor(private orgService: OrganizationService, private fb: FormBuilder) {}
  ngOnInit(): void {
    if (this.accessGroup == "B2B_Super_User") {
      this.populatedList = this.userList;
    }
    else if (this.accessGroup === "B2B_Org_Admin") {
      const temp = this.userList;
      temp.splice(0, 2);
      this.populatedList = this.userList;
    }
    else {
      this.populatedList = [];
    }
    this.form = this.fb.group({
      email: ['', [Validators.required]],
      userRole: [null, [Validators.required]],
      newAccessType: [null, [Validators.required]],
    });
  }

  inviteOrganizationUser() {
    const { email, userRole: accessType, newAccessType } = this.form.value;
    const payload = {
      orgId: this.organizationId,
      email,
      accessType,
      newAccessType,
    }
    this.orgService.inviteNewUser(payload).subscribe(
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
}