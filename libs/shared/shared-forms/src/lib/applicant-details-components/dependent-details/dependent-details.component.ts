import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicantDataInput } from '../../base-classes';

@Component({
  selector: 'fan-id-dependent-details',
  templateUrl: './dependent-details.component.html',
  styleUrls: ['./dependent-details.component.scss'],
})
export class DependentDetailsComponent extends ApplicantDataInput {

  constructor(
    private router: Router,
  ) {
    super();
  }

  viewDetails() {
    // workaround for same navigation issue.
    let base = 'applicant-details';
    const endpoint = this.router.url.split('?')[0].split('/').pop();
    base = endpoint === base ? 'dependent-' + base : base;
    this.router.navigate(['main/all-applications/list/'+ base], {
      queryParams: { fanid: this.applicant_data?.fanIdNo },
    });
  }
}
