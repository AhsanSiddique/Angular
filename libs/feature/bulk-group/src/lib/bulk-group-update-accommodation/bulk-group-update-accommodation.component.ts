import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { BulkGroupService, UpdateBulkGroupAccommodationDetailsRequest } from '@fan-id/api/server';
import { ACCOMMODATION_DETAILS_VALIDATORS } from '@fan-id/shared/utils/form';

@Component({
  selector: 'fan-id-bulk-group-update-accommodation',
  templateUrl: './bulk-group-update-accommodation.component.html',
  styleUrls: ['./bulk-group-update-accommodation.component.scss']
})
export class BulkGroupUpdateAccommodationComponent implements OnInit {
  @Input() bulkgroup_data: any;
  @Output() _close = new EventEmitter();

  updateForm = this.fb.group({
    accommodation_details: ['', ACCOMMODATION_DETAILS_VALIDATORS],
  })

  update_success = false;
  update_error = false;
  error_message: string;

  constructor(private fb: FormBuilder, private bulkgroupService: BulkGroupService) { }

  ngOnInit() {
    if(this.bulkgroup_data?.orgGroupAccommodationAddress) {
      this.uf.accommodation_details.patchValue(this.bulkgroup_data.orgGroupAccommodationAddress);
    }
  }

  get uf() {
    return this.updateForm.controls;
  }

  submitForm() {
    if (this.updateForm.invalid) {
      return;
    }
    const body: UpdateBulkGroupAccommodationDetailsRequest = {
      orgGroupAccommodationAddress: this.uf.accommodation_details.value,
      bulkGroupName: this.bulkgroup_data?.bulkGroupName,
      refTournament_Code: this.bulkgroup_data?.eventCode
    }
    this.bulkgroupService.updateBulkGroupAccommodationDetails(body)
      .subscribe({
        next: (response) => {
          console.log(response);
          this.update_success = true;
        },
        error: (error) => {
          console.log(error);
          this.update_error = true;
          this.error_message = error?.error?.message ?? 'Something went wrong';
        }
      })
  }

}
