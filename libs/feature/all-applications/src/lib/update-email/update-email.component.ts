import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllApplicationsService, MetadataParams, MetadataResolve, MetadataService, NationalityLookup } from '@fan-id/api/server';
import { Observable } from 'rxjs';
const EmailRegex = /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;

@Component({
  selector: 'fan-id-update-email',
  templateUrl: './update-email.component.html',
  styleUrls: ['./update-email.component.scss']
})
export class UpdateEmailComponent implements OnInit {
 @Output() closeThis = new EventEmitter();
  @Input() data:any;
  @Input() metadata$: Observable<MetadataResolve>;
  @Output() submitData = new EventEmitter<any>()
  countries: Observable<any[]>;
  
  updateContactForm!: FormGroup;
  metaDataLookupParam: MetadataParams = {};
  countryCode:any;
EmailRegex= /^(?![.-])((?![_.-][_.-])[a-zA-Z\d_.-]){0,63}[a-zA-Z\d_]@((?!-)((?!--)[a-zA-Z\d-]){0,63}[a-zA-Z\d]\.){1,2}([a-zA-Z]{2,14}\.)?[a-zA-Z]{2,14}$/;

  constructor(private fb: FormBuilder,
    private metadataService: MetadataService,
    private aps: AllApplicationsService) { }

  ngOnInit(): void {
    this.updateContactForm = this.fb.group({
      emailId: ['', Validators.required,,Validators.pattern(EmailRegex)],
    })
  }

  Submit(){
        const body={
          applicationEmail: this.updateContactForm.get('emailId').value,
          applicationId : this.data.id
        }

        console.log("this.data",this.data,body);

      this.submitData.emit(body);
  }

}
