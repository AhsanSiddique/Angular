import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'fan-id-form-field-error',
  template: `
    <div
      class="invalid-feedback d-block"
      *ngIf="
        field_control && field_control.invalid && (field_control.touched || isExcel)
      "
    >
      <span *ngIf="field_control.errors?.required">
        {{ 'ErrorMessage.EnterTheDetails' | translate }}
      </span>
      <span
        *ngIf="
          field_control.errors?.maxlength || field_control.errors?.minlength
        "
      >
        {{
          'ErrorMessage.' +
            (field_control.errors?.maxlength ? 'Maximum' : 'Minimum')
            | translate
        }}
        {{
          field_control.errors[
            field_control.errors?.maxlength ? 'maxlength' : 'minlength'
          ].requiredLength
        }}
        {{ 'ErrorMessage.characters' | translate }}
      </span>
      <span
        *ngIf="
          field_control.errors?.min ||
          field_control.errors?.max ||
          field_control.errors?.pattern ||
          field_control.errors?.ngbDate ||
          field_control.errors?.invalidDocExpiry ||
          field_control.errors?.invalidArabicName
        "
      >
        {{ 'ErrorMessage.EnterValidDetails' | translate }}
      </span>
    </div>
  `,
  styles: [
    `
      .invalid-feedback:after {
        content: '*';
      }
    `,
  ],
})
export class FormFieldErrorComponent {
  @Input() field_control: FormControl;
  @Input() isExcel?: boolean =false;
}
