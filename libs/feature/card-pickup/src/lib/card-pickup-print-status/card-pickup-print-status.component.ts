import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-card-pickup-print-status',
  templateUrl: './card-pickup-print-status.component.html',
  styleUrls: ['./card-pickup-print-status.component.scss']
})
export class CardPickupPrintStatusComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() status:any;
  failedList = []
  successList = []
  cardPrintList =[]
  constructor() { 

  }

  ngOnInit(): void {
    this.failedList = this.status.response.failedList.map(x => 
      x ={...x.data, failureReason:x.reason.message?x.reason.message:x.reason, failedStatus:true,});
    this.successList = this.status.response.successList.map(x => x.data ={...x.data,failureReason:'N/A', failedStatus:false});
    this.cardPrintList = [...this.successList,...this.failedList]
   }

}
