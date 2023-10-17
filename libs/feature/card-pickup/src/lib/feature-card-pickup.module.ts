import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewCardDetailsComponent } from './view-card-details/view-card-details.component';
import { PrintCardDialogueComponent } from './print-card-dialogue/print-card-dialogue.component';
import { PrintCardListDialogueComponent } from './print-card-list-dialogue/print-card-list-dialogue.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@fan-id/feature/auth';
import { TranslateModule } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { ApiServerModule, ApplicantDetailResolver, CardDetailResolver, CardIntegrationStatusResolver } from '@fan-id/api/server';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { CoreModule } from '@fan-id/core';
import { CardListComponent } from './card-list/card-list.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { UpdateStatusModalComponent } from './update-status-modal/update-status-modal.component';
import { CardImportStatusComponent } from './card-import-status/card-import-status.component';
import { CardPickupPrintStatusComponent } from './card-pickup-print-status/card-pickup-print-status.component';
import { CardHistoryPageComponent } from './card-history/card-history.page';
import { CardActionListComponent } from './card-history/card-action-list/card-action-list.component';
import { CardDetailsTableComponent } from './card-history/card-details-table/card-details-table.component';
import { QRCodeModule } from 'angularx-qrcode';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        children: [
          {
            path: '',
            component: CardListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'view-details',
            component: ViewCardDetailsComponent,
            canActivate: [AuthGuard],
            resolve: {
              applicantDetail: ApplicantDetailResolver,
              cardDetail: CardDetailResolver,
              cardIntegrationStatus: CardIntegrationStatusResolver
            },
          },
          {
            path: 'card-history',
            component: CardHistoryPageComponent,
            canActivate: [AuthGuard],
          }
        ]
      },
      {
        path: '',
        redirectTo: 'list',
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    DataTablesModule,
    ApiServerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedHeaderSidebarModule,
    CoreModule,
    SharedSharedFormsModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    SharedSharedComponentsModule,
    NgxPaginationModule,
    NgbModule,
    QRCodeModule
  ],
  providers: [AuthGuard],

  declarations: [
    ViewCardDetailsComponent,
    PrintCardDialogueComponent,
    PrintCardListDialogueComponent,
    CardListComponent,
    UpdateStatusModalComponent,
    CardImportStatusComponent,
    CardPickupPrintStatusComponent,
    CardHistoryPageComponent,
    CardActionListComponent,
    CardDetailsTableComponent,
  ],
})
export class FeatureCardPickupModule {}
