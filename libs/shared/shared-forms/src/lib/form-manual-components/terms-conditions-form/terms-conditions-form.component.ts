import { Component } from '@angular/core';
import { MetadataService, TournamentType } from '@fan-id/api/server';
import { map, take } from 'rxjs/operators';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-terms-conditions-form',
  templateUrl: './terms-conditions-form.component.html',
  styleUrls: ['./terms-conditions-form.component.scss'],
})
export class TermsConditionsFormComponent extends FormGroupInput {
  constructor(private metadataService: MetadataService) {
    super();
  }

  tnc: any;
  show_terms_and_condition = false;
  eventType = parseInt(localStorage.getItem('eventType')) as TournamentType;

  showTermsAndConditions() {
    this.metadataService
      .getStaticContent({ code: 'TERMSANDCONDITIONS' })
      .pipe(
        map((response: any) => {
          return response?.data;
        }),
        take(1)
      )
      .subscribe((_tnc) => {
        if (!_tnc) {
          alert('Something went wrong!');
          return;
        }
        this.tnc = _tnc;
        this.show_terms_and_condition = true;
      });
  }

  close(event) {
    this.show_terms_and_condition = false;
    if (event == 'agree') {
      this.formGroup.controls['check'].setValue(true);
    } else if (event == 'decline') {
      this.formGroup.controls['check'].setValue(false);
    }
  }
}
