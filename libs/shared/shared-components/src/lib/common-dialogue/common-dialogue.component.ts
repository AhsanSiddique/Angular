import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'fan-id-common-dialogue',
  templateUrl: './common-dialogue.component.html',
  styleUrls: ['./common-dialogue.component.scss'],
})
export class CommonDialogueComponent {
  @Input() Header = '';
  @Input() Body = '';
  @Input() FanId?:string = '';
  @Input() buttonText?:string='';
  @Output() closeThis = new EventEmitter();
}
