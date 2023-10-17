import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-update-info-alert-modal',
  templateUrl: './update-info-alert-modal.component.html',
  styleUrls: ['./update-info-alert-modal.component.scss']
})
export class UpdateInfoAlertModalComponent {
  @Output() closeThis = new EventEmitter<'proceed' | 'cancel'>();
  @Input() _type: 'update' | 'resubmit' = 'update';
}
