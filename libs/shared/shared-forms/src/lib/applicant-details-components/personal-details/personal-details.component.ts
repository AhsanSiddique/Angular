import { Component, Inject, Input, OnInit } from '@angular/core';
import { MetadataResolve, MetadataService } from '@fan-id/api/server';
import { Environment, FanIDConfig } from '@fan-id/core';
import { Observable } from 'rxjs';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-personal-details',
  templateUrl: './personal-details.component.html',
  styleUrls: ['./personal-details.component.scss'],
})

export class PersonalDetailsComponent extends ApplicantDataInput implements OnInit {

  @Input() metadata$: Observable<MetadataResolve>;
  TICKET_HOLDERS: string[]
  VOUCHER_HOLDERS: string[]
  isNationalityArab = false;
  arab_nationalities: string[];
  isServiceCenter = false;
  isDocumentPassport = false;

  constructor(private metadataService: MetadataService,
    @Inject(FanIDConfig) private appconfig: Environment,
    ) {
    super();
    this.TICKET_HOLDERS = this.metadataService.getTicketHolders();
    this.VOUCHER_HOLDERS = this.metadataService.getVoucherHolders();
    this.arab_nationalities = this.metadataService.getArabNationalities();
    this.isServiceCenter = this.appconfig.application === 'ServiceCenter';
  }

  ngOnInit() {
    this.isNationalityArab = [...this.arab_nationalities, 'XR'].includes(this.applicant_data?.nationality_code);
    this.isDocumentPassport = this.applicant_data?.document_type === 'Passport';

    const { medical } = this.applicant_data ?? {};
    if(medical) {
      this.applicant_data.medical = (medical as string).split(',')[0];
    }
  }
}
