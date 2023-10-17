import { Component, Input } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MetadataResolve } from '@fan-id/api/server';
import { Observable } from 'rxjs';
import { FormGroupInput } from '../../base-classes';

@Component({
  selector: 'fan-id-emergency-contact-form',
  templateUrl: './emergency-contact-form.component.html',
  styleUrls: ['./emergency-contact-form.component.scss'],
})
export class EmergencyContactFormComponent
  extends FormGroupInput {
  constructor() {
    super();
  }

  @Input() metadata$:Observable<MetadataResolve>
  @Input() fan_category: FormControl
  @Input() _mobile: FormControl
  @Input() _phonecode: FormControl


  get ef() {
    return this.formGroup.controls;
  }

  get efControls() {
    return (this.ef.emergency_contacts as FormArray).controls;
  }

  get isVIP() {
    return this.fan_category?.value === 'VIP';
  }
}
