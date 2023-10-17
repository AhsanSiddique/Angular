import { CoreService } from '@fan-id/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fan-id-service-center',
  templateUrl: './service-center.component.html',
  styleUrls: ['./service-center.component.scss'],
})
export class ServiceCenterComponent implements OnInit {
  constructor(private coreService: CoreService) {}

  public layoutdirltr: any;

  ngOnInit(): void {
    this.layoutdirltr = this.coreService.layoutDirLTR;
  }
}
