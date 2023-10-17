import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-submission-status',
  templateUrl: './submission-status.component.html',
  styleUrls: ['./submission-status.component.scss']
})
export class SubmissionStatusComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  @Input() status:any;

  constructor() { }

  ngOnInit(): void {
  }

}
