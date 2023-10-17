import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@fan-id/feature/auth';
import { CommonModule } from '@angular/common';
import { CardReplacementListComponent } from './card-replacement-list/card-replacement-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataTablesModule } from 'angular-datatables';
import { ApiServerModule, ApplicantDetailResolver, CardDetailResolver, CardIntegrationStatusResolver, MetadataResolver } from '@fan-id/api/server';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { CoreModule } from '@fan-id/core';
import { CardReplacementDialogComponent } from './card-replacement-dialog/card-replacement-dialog.component';
import { CardReplacementConfirmationComponent } from './card-replacement-confirmation/card-replacement-confirmation.component';
import { ViewCardDetailsComponent } from './view-card-details/view-card-details.component';
import { EditCardApplicantDetailsComponent } from './edit-card-applicant-details/edit-card-applicant-details.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PrintCardImageComponent } from './print-card-image/print-card-image.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        children: [
          {
            path: '',
            component: CardReplacementListComponent,
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
            path: 'edit-details',
            component: EditCardApplicantDetailsComponent,
            resolve: {
              metadata: MetadataResolver,
              applicantDetail: ApplicantDetailResolver,
            },
            canActivate: [AuthGuard],
          },
        ],
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
    SharedSharedComponentsModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    NgxPaginationModule,
    NgbModule,
    NgxSpinnerModule
  ],
  providers: [AuthGuard],
  declarations: [
    CardReplacementListComponent,
    CardReplacementDialogComponent,
    CardReplacementConfirmationComponent,
    ViewCardDetailsComponent,
    EditCardApplicantDetailsComponent,
    PrintCardImageComponent,
  ],
  exports: [ViewCardDetailsComponent],
})
export class FeatureCardReplacementModule {}
