import { Directive, Input } from '@angular/core';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class ApplicantDataInput {
  @Input()
  applicant_data: any;
}
