import { Component, OnInit, ViewChild } from '@angular/core';
import { ScrollService } from '@fan-id/core';
import { TTableComponent } from '../accommodation.common';

@Component({
  selector: 'fan-id-accomadation-list',
  templateUrl: './accomadation-list.component.html',
  styleUrls: ['./accomadation-list.component.scss']
})
export class AccomadationListComponent implements OnInit {
  @ViewChild("tableComponent")
  tableComponent!: TTableComponent;

  eventName;
  displayEventName;
  active = 1;
  normalFilterBoolean = false;
  advancedFilterBoolean = false;
  constructor(private scrollService: ScrollService) {
    this.active = parseInt(localStorage.getItem('acc_activetab') as string) || 1;
    this.eventName = localStorage.getItem('event');
    this.displayEventName = localStorage.getItem('displayEvent');
  }

  ngOnInit() {
    this.scrollService.scrollToTop();
  }

  filterBooleans(event) {
    this.normalFilterBoolean = event.normal;
    this.advancedFilterBoolean = event.advanced;
  }

  activeTab() {
    localStorage.setItem('acc_activetab', this.active.toString())
  }
}
