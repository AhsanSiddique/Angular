import { Component, Input } from '@angular/core';

@Component({
  selector: 'fan-id-fieldset-wrapper',
  templateUrl: './fieldset-wrapper.component.html',
  styleUrls: ['./fieldset-wrapper.component.scss'],
})
export class FieldsetWrapperComponent {
  @Input() title = '';
  @Input() sectionDisabled = false;
  @Input() sectionValid? = false;
  @Input() titleDisabled = false;
  @Input() titleIndex?: string;
}
