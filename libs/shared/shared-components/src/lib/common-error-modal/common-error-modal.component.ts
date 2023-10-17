import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-common-error-modal',
  templateUrl: './common-error-modal.component.html',
  styleUrls: ['./common-error-modal.component.scss'],
})
export class CommonErrorModalComponent {
  @Input() head_error_message: string;
  @Input() error_message: string;
  @Input() buttontext?: string = 'Common.GotoHome';
  @Input() content_mode?: 'text' | 'project' = 'text';
  @Output() closeThis = new EventEmitter();

  goToHome() {
    this.closeThis.emit('false');
  }

  close() {
    this.closeThis.emit('close');
  }
}
