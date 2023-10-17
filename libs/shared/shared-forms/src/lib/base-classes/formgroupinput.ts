import { Directive, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateKey } from './translatekey';
import { getFormExtras } from '@fan-id/shared/utils/form';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class FormGroupInput extends TranslateKey {
  @Input() formGroup: FormGroup;
  @Input() parentForm?: FormGroup;

  get b2bVisaType() {
    return getFormExtras(this.parentForm).b2bVisaType;
  }

  get conferenceType() {
    return getFormExtras(this.parentForm).conferenceType;
  }

  get _formExtras() {
    return getFormExtras(this.parentForm);
  }
}
