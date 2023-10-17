import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-modal-save-confirm',
  templateUrl: './modal-save-confirm.component.html',
  styleUrls: ['./modal-save-confirm.component.scss'],
})
export class ModalSaveConfirmComponent {
  @Input() title: string;
  @Output() closeThis = new EventEmitter();
  @Output() saveThis = new EventEmitter();

  close() {
    this.closeThis.emit('close');
  }

  save() {
    this.saveThis.emit('save');
  }
}
