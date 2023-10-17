import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-bulk-upload-cancel',
  templateUrl: './bulk-upload-cancel.component.html',
  styleUrls: ['./bulk-upload-cancel.component.scss']
})
export class BulkUploadCancelComponent {
  @Input() type: 'cancel' | 'exit';
  @Input() message='';
  @Output() _close = new EventEmitter();

  @Output() _proceed = new EventEmitter();

  // @Output() _cancel = new EventEmitter();

  cancel() {
    this._close.emit('close')
  }

  proceed() {
    this._proceed.emit('proceed')
  }
}
