import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-package-upload-delete',
  templateUrl: './package-upload-delete.component.html',
  styleUrls: ['./package-upload-delete.component.scss']
})
export class PackageUploadDeleteComponent {
  @Input() header = 'Alert';
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
