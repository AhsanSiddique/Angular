import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'fan-id-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss'],
})
export class TermsAndConditionsComponent {
  @Output() closeThis = new EventEmitter();

  @Input() tnc: any
}
