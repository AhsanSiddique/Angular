import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-warning',
  templateUrl: './warning.component.html',
  styleUrls: ['./warning.component.scss']
})
export class WarningComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() warningMsg:any;

  constructor() { }

  ngOnInit(): void {
  }

}
