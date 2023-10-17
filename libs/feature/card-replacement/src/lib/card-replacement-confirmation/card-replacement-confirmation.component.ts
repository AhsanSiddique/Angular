import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'fan-id-card-replacement-confirmation',
  templateUrl: './card-replacement-confirmation.component.html',
  styleUrls: ['./card-replacement-confirmation.component.scss']
})
export class CardReplacementConfirmationComponent {
@Input () confirmCheck?:boolean = false;
@Input () header?:string ='';
@Output() closeThis = new EventEmitter();

}
