import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-common-success-modal',
  templateUrl: './common-success-modal.component.html',
  styleUrls: ['./common-success-modal.component.scss'],
})
export class CommonSuccessModalComponent {
  @Input() head_success_message: string;
  @Input() success_message: string;
  @Input() note?: string;
  @Input() buttontext?: string = 'Common.GotoHome';
  @Output() closeThis = new EventEmitter();

  close() {
    this.closeThis.emit('close');
  }
}
