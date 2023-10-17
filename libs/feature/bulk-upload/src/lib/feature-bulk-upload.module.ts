import { TranslateModule } from '@ngx-translate/core';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkUploadStep1Component } from './bulk-upload-step1/bulk-upload-step1.component';
import { BulkUploadStep2Component } from './bulk-upload-step2/bulk-upload-step2.component';
import { BulkUploadStep3Component } from './bulk-upload-step3/bulk-upload-step3.component';
import { BulkUploadStep4Component } from './bulk-upload-step4/bulk-upload-step4.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { ApiServerModule, MetadataResolver } from '@fan-id/api/server';
import { RouterModule, Routes } from '@angular/router';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { AuthGuard } from '@fan-id/feature/auth';
import { CoreModule } from '@fan-id/core';
import { ProcessingComponent } from './processing/processing.component';
import { SubmissionStatusComponent } from './submission-status/submission-status.component';
import{ SharedSharedComponentsModule} from '@fan-id/shared/shared-components'
import { FeatureManualUploadNoRoutingModule } from '@fan-id/feature/manual-upload';
import { BulkUploadCancelComponent } from './bulk-upload-cancel/bulk-upload-cancel.component';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'step-1',
        component: BulkUploadStep1Component,
        canActivate: [AuthGuard],
      },
      {
        path: 'step-2',
        component: BulkUploadStep2Component,
        canActivate: [AuthGuard],
      },
      {
        path: 'edit-application',
        component: BulkUploadStep3Component,
        canActivate: [AuthGuard],
        resolve: {
          metadata: MetadataResolver
        },
      },
    ],
  },
];
@NgModule({
  imports: [
    CommonModule,
    SharedHeaderSidebarModule,
    SharedSharedComponentsModule,
    SharedSharedFormsModule,
    RouterModule.forChild(routes),
    ApiServerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    CoreModule,
    TranslateModule.forChild(),
    FeatureManualUploadNoRoutingModule
  ],
  declarations: [
    BulkUploadStep1Component,
    BulkUploadStep2Component,
    BulkUploadStep3Component,
    BulkUploadStep4Component,
    ProcessingComponent,
    SubmissionStatusComponent,
    BulkUploadCancelComponent,
  ],
  exports: [ProcessingComponent, SubmissionStatusComponent],
  providers: [AuthGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class FeatureBulkUploadModule {}
