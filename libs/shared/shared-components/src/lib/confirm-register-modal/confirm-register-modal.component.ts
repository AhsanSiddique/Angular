import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-confirm-register-modal',
  templateUrl: './confirm-register-modal.component.html',
  styleUrls: ['./confirm-register-modal.component.scss']
})
export class ConfirmRegisterModalComponent {
  @Output() closeThis = new EventEmitter<'proceed' | 'close'>();
  @Input() isServiceCenter: boolean;
}
