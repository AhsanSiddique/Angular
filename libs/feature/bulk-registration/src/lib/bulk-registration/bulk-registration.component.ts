import { CoreService } from './../../../../../core/src/lib/core.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'fan-id-bulk-registration',
  templateUrl: './bulk-registration.component.html',
  styleUrls: ['./bulk-registration.component.scss'],
})
export class BulkRegistrationComponent implements OnInit {
  constructor(private coreService: CoreService) {}

  public layoutdirltr: any;

  ngOnInit(): void {
    this.layoutdirltr = this.coreService.layoutDirLTR;
  }
}
