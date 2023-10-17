import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllApplicationsService, MetadataParams, MetadataResolve, MetadataService, NationalityLookup } from '@fan-id/api/server';
import { Observable } from 'rxjs';
const EmailRegex = /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;

@Component({
  selector: 'fan-id-update-emailid',
  templateUrl: './update-emailid.component.html',
  styleUrls: ['./update-emailid.component.scss']
})
export class UpdateEmailidComponent {
  @Output() closeThis = new EventEmitter();
  @Input() data:any;
  // @Input() metadata$: Observable<MetadataResolve>;
  @Output() submitData = new EventEmitter<any>()
  
  updateVoucherEmail!: FormGroup;
  

  constructor(private fb: FormBuilder,) {
    this.updateVoucherEmail = this.fb.group({
      emailId:[null,[Validators.required,Validators.pattern(EmailRegex)]],
    })
   }

  Submit(){
    const body = {
      email:this.updateVoucherEmail.controls.emailId.value,
      refEvent_Code:localStorage.getItem('eventCode'),
      id:this.data
    }
    this.submitData.emit(body);
  }

}
