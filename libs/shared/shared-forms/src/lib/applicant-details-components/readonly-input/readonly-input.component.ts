import { Component, Input } from '@angular/core';

@Component({
  selector: 'fan-id-readonly-input',
  template: `
    <div class="readonly-input">
      <label [for]="id">
        {{
          translateKey
            ? (translateKey + '.' + (label | removewhitespace) | translate)
            : label
        }}
      </label>
      <input
        class="form-control"
        type="text"
        [name]="id"
        [id]="id"
        [value]="value ?? ''"
        disabled
        readonly
      />
    </div>
  `,
  styleUrls: ['./readonly-input.component.scss'],
})
export class ReadonlyInputComponent {
  @Input() label: string;
  @Input() value: string;
  @Input() translateKey: string;
  @Input() id: string;
  @Input() placeholder: string;
}
