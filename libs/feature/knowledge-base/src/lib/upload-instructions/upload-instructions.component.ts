import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'fan-id-upload-instructions',
  templateUrl: './upload-instructions.component.html',
  styleUrls: ['./upload-instructions.component.scss']
})
export class UploadInstructionsComponent implements OnInit {
@Output() close = new EventEmitter();
  constructor() { }
  selectedInstructionPill =1;
  ngOnInit(): void {
  }

}
