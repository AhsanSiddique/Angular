import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { CoreModule } from '@fan-id/core';
import { ApiServerModule, MetadataResolver } from '@fan-id/api/server';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { BulkGroupStep2Component } from './bulk-group-step2/bulk-group-step2.component';
import { AuthGuard } from '@fan-id/feature/auth';
import { BulkGroupStep1Component } from './bulk-group-step1/bulk-group-step1.component';
import { TranslateModule } from '@ngx-translate/core';
import { FeatureManualUploadNoRoutingModule } from '@fan-id/feature/manual-upload';
import { BulkGroupImportComponent } from './bulk-group-import/bulk-group-import.component';
import { BulkGroupDraftEditComponent } from './bulk-group-draft-edit/bulk-group-draft-edit.component'
import { BulkGroupApplicationDetailsComponent } from './bulk-group-application-details/bulk-group-application-details.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BulkGroupUpdateAccommodationComponent } from './bulk-group-update-accommodation/bulk-group-update-accommodation.component';
import { BulkPaymentComponent } from './bulk-payment/bulk-payment.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'step-1',
        component: BulkGroupStep1Component,
        canActivate: [AuthGuard],
      },
      {
        path: 'bulk-group-application-details',
        component: BulkGroupApplicationDetailsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'continue',
        component: BulkGroupImportComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'edit',
        component: BulkGroupDraftEditComponent,
        canActivate: [AuthGuard],
        resolve: {
          metadata: MetadataResolver
        },
      },
      {
        path: 'step-2',
        component: BulkGroupStep2Component,
        canActivate: [AuthGuard],
      },
      {
        path: 'bulk-payment',
        component: BulkPaymentComponent,
        canActivate: [AuthGuard],
      },
      {
        path: '',
        redirectTo: 'step-1',
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedHeaderSidebarModule,
    ApiServerModule,
    NgSelectModule,
    DataTablesModule,
    CoreModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    TranslateModule.forChild(),
    FeatureManualUploadNoRoutingModule,
    SharedSharedComponentsModule,
    SharedSharedFormsModule,
    NgxSpinnerModule,
    NgbModule
  ],
  declarations: [BulkGroupStep1Component, BulkGroupStep2Component, BulkGroupImportComponent, BulkGroupDraftEditComponent,BulkGroupApplicationDetailsComponent, BulkGroupUpdateAccommodationComponent, BulkPaymentComponent],
  providers: [AuthGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class FeatureBulkGroupModule {}
