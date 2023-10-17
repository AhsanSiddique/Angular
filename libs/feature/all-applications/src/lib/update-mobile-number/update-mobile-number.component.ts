import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AllApplicationsService, MetadataParams, MetadataResolve, MetadataService, NationalityLookup } from '@fan-id/api/server';
import { Observable } from 'rxjs';

@Component({
  selector: 'fan-id-update-mobile-number',
  templateUrl: './update-mobile-number.component.html',
  styleUrls: ['./update-mobile-number.component.scss']
})
export class UpdateMobileNumberComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() data:any;
  @Input() metadata$: Observable<MetadataResolve>;
  @Output() submitData = new EventEmitter<any>()
  countries: Observable<any[]>;
  
  updateContactForm!: FormGroup;
  metaDataLookupParam: MetadataParams = {};
  countryCode:any;
  constructor(private fb: FormBuilder,
    private metadataService: MetadataService,
    private aps: AllApplicationsService) { }

  ngOnInit(): void {
    this.countries = this.metadataService.getDialingCodes();
    this.updateContactForm = this.fb.group({
      dialingCode: [this.data.phoneAreaNatCode,!this.data.isChildApplication?[Validators.required]:""],
      mobilenumber: [this.data.phone,!this.data.isChildApplication?[Validators.required,
        Validators.maxLength(15)]:""],
      EmergencyContactName:[this.data.emergencyContactOneFullName?this.data.emergencyContactOneFullName:null,this.data.docTypeId===3?Validators.required:""],
      EmergencyContactCountryCode: [this.data.emergencyContactOnePhoneAreaNatCode,this.data.docTypeId===3?Validators.required:""],
      EmergencyContactNumber: [this.data.emergencyContactOnePhone?this.data.emergencyContactOnePhone:null,
        this.data.docTypeId===3?[Validators.required,
          Validators.maxLength(15)]:""],
    })
    this.countryCode = this.data.dialingCode
  }

  Submit(){
    console.log(this.updateContactForm.get('dialingCode').value);
    // this.closeThis.emit('submit');
    this.metadataService.getDialingCodes().subscribe(response=>{
    var contactcode=  response.find(item=>item.code===this.updateContactForm.get('dialingCode').value);
        var emergencycontactcode=  response.find(item=>item.code===this.updateContactForm.get('EmergencyContactCountryCode').value);
        const body={
          fanIdNo: this.data.fanIdNo,
          email:this.data.email,
          phoneAreaCode:contactcode.dialingCode,
          phone:  this.updateContactForm.get('mobilenumber').value,
          emergencyContactOneFullName:this.data.docTypeId===3? this.updateContactForm.get('EmergencyContactName').value:this.data.emergencyContactOneFullName,
          emergencyContactOnePhoneAreaCode: this.data.docTypeId===3?emergencycontactcode.dialingCode:this.data.emergencyContactOnePhoneAreaCode,
          emergencyContactOnePhone: this.data.docTypeId===3?this.updateContactForm.get('EmergencyContactNumber').value:this.data.emergencyContactOnePhone,
          submitReasonType: 0,
          phoneAreaNatCode: contactcode.code,
          emergencyContactOnePhoneAreaNatCode: this.data.docTypeId===3?emergencycontactcode.code:this.data.emergencyContactOnePhoneAreaNatCode
        }
        
      this.submitData.emit(body);
    })
  }

}
