import { Component, Input, OnInit } from '@angular/core';
import { MetadataResolve, MetadataService } from '@fan-id/api/server';
import { Observable } from 'rxjs';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-emergency-contact-details',
  templateUrl: './emergency-contact-details.component.html',
  styleUrls: ['./emergency-contact-details.component.scss'],
})
export class EmergencyContactDetailsComponent extends ApplicantDataInput implements OnInit {
  @Input() metadata$: Observable<MetadataResolve>;
  emer1PhoneCode:string;
  emer2PhoneCode:string;

  constructor(private metadataService: MetadataService) {
    super();
  }

  ngOnInit() {
    this.metadataService.getDialingCodes().subscribe(data=>{
      data.forEach(item=>{
        if(item.dialingCode === this.applicant_data?.emergencyContactOnePhoneAreaCode){
          this.emer1PhoneCode = item.code
        }
        if(item.dialingCode === this.applicant_data?.emergencyContactTwoPhoneAreaCode){
          this.emer2PhoneCode = item.code
        }
      })
    });

    let { emergency_contacts } = this.applicant_data ?? {};
    emergency_contacts = [...emergency_contacts].filter((contact, index) => {
      if(index !== 0) {
        if(!contact) return false;
        return Object.values(contact).filter(Boolean).length > 0;
      }
      return true;
    })

    this.applicant_data.emergency_contacts = emergency_contacts;
  }
}
