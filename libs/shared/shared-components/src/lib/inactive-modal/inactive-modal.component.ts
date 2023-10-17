import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-inactive-modal',
  templateUrl: './inactive-modal.component.html',
  styleUrls: ['./inactive-modal.component.scss']
})
export class InactiveModalComponent implements OnInit {

  @Output() logout = new EventEmitter();
  @Output() close = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  continue(){
    this.close.emit();
  }
  closeLogout(){
    this.logout.emit();
  }
}
