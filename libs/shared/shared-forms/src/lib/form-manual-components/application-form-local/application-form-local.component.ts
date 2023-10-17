import { Component, Input } from '@angular/core';
import { MetadataResolve } from '@fan-id/api/server';
import { nationalitySearchFn } from '@fan-id/shared/utils/common';
import { Observable } from 'rxjs';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-application-form-local',
  templateUrl: './application-form-local.component.html',
  styleUrls: ['./application-form-local.component.scss']
})
export class ApplicationFormLocalComponent extends FormGroupInput {

  constructor() {
    super();
  }

  @Input() metadata$:Observable<MetadataResolve>

  get af() {
    return this.formGroup.controls;
  }

  get gcc_country() {
    return this.af.gcc_country;
  }

  get fan_category() {
    return this.af.fan_category;
  }

  get nationality() {
    return this.af.nationality;
  }

  get application_type() {
    return this.af.application_type;
  }

  get current_country() {
    return this.af.current_country;
  }

  get nationalitySearchFn() {
    return nationalitySearchFn;
  }


  onApplicationTypeSelect(application_type: string) {
    const current_country = application_type === 'QRC' ? 'QA' : null;
    this.current_country.setValue(current_country);
    this.gcc_country.patchValue('');
    this.fan_category.patchValue('MTH');
    this.nationality.patchValue(null);
    this.current_country.markAsUntouched({ onlySelf: true });
    this.gcc_country.markAsUntouched({ onlySelf: true });
    this.fan_category.markAsUntouched({ onlySelf: true });
    this.nationality.markAsUntouched({ onlySelf: true });
  }

  onGCCSelect(gcc_country: string) {
    this.current_country.patchValue(gcc_country);
  }

}
