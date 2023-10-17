import { Component, Input } from '@angular/core';
import { CustomerCardIntegrationResponse } from '@fan-id/api/server';

interface CardIntegrationStatusDetail extends CustomerCardIntegrationResponse {
  printingStatus: number,
  printingStatus_Name: string,
  cardStatus:number
}
@Component({
  selector: 'fan-id-integration-status',
  templateUrl: './integration-status.component.html',
  styleUrls: ['./integration-status.component.scss']
})
export class IntegrationStatusComponent {
  @Input() card_integration_data: CardIntegrationStatusDetail
}
