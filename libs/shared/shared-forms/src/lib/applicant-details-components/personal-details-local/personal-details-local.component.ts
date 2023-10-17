import { Component, Input, OnInit } from '@angular/core';
import { MetadataResolve, MetadataService } from '@fan-id/api/server';
import { Observable } from 'rxjs';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-personal-details-local',
  templateUrl: './personal-details-local.component.html',
  styleUrls: ['./personal-details-local.component.scss']
})
export class PersonalDetailsLocalComponent extends ApplicantDataInput implements OnInit {
  @Input() metadata$: Observable<MetadataResolve>;
  phoneFalgcode:string;
  constructor(private metadataService: MetadataService) {
    super();
  }
  ngOnInit() {
    this.metadataService.getDialingCodes().subscribe(data=>{
      data.forEach(item=>{
        if(item.dialingCode === this.applicant_data.country_code){
          this.phoneFalgcode = item.code
        }
      })
    });
    const { medical } = this.applicant_data ?? {};
    if(medical) {
      this.applicant_data.medical = (medical as string).split(',')[0];
    }
  }
}
