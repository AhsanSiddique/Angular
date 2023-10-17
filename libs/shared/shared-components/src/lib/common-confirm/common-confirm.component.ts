import { Component, EventEmitter, Input, Output } from '@angular/core';

enum FooterActionType {
  YesNo = 1,
  Ok = 2
}
@Component({
  selector: 'fan-id-common-confirm',
  templateUrl: './common-confirm.component.html',
  styleUrls: ['./common-confirm.component.scss']
})
export class CommonConfirmComponent  {
  @Input() title = 'Alert';
  @Input() message = 'Are you sure?';
  @Input() hasCloseButton = false;
  @Input() footerActionType = FooterActionType.YesNo;
  @Input() okText = 'OK';
  @Output() closeThis = new EventEmitter<'yes' | 'no'>();
}
