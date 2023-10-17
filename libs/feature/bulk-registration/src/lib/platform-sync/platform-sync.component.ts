import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'fan-id-platform-sync',
  templateUrl: './platform-sync.component.html',
  styleUrls: ['./platform-sync.component.scss']
})
export class PlatformSyncComponent implements OnInit {
  @Output() closeThis = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

}
