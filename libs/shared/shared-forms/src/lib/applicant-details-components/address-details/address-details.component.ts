import { Component, OnInit } from '@angular/core';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.scss'],
})
export class AddressDetailsComponent
  extends ApplicantDataInput
  implements OnInit {
  address_line_labels = {
    1: 'Address Line 1',
    2: 'Address Line 2',
    3: 'Address Line 3',
    4: 'ZIP Code/PO Box',
  };
  ngOnInit() {
    if (this.applicant_data?.address_country === 'Qatar') {
      this.address_line_labels = {
        1: 'Building Number',
        2: 'Zone Number',
        3: 'Unit Number',
        4: 'Street Number',
      };
    }
  }
}
