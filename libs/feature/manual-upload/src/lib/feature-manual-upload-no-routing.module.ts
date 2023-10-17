import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManualUploadStep1Component } from './manual-upload-step1/manual-upload-step1.component';
import { ManualUploadStep2Component } from './manual-upload-step2/manual-upload-step2.component';
import { ManualUploadStep3Component } from './manual-upload-step3/manual-upload-step3.component';
import { ManualUploadStep4Component } from './manual-upload-step4/manual-upload-step4.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiServerModule } from '@fan-id/api/server';
import { RouterModule } from '@angular/router';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthGuard } from '@fan-id/feature/auth';
import { DataTablesModule } from 'angular-datatables';
import { ProcessingComponent } from './processing/processing.component';
import { SubmissionStatusComponent } from './submission-status/submission-status.component';
import { TranslateModule } from '@ngx-translate/core';
import { CoreModule } from '@fan-id/core';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { ManualUploadEditDraftComponent } from './manual-upload-edit-draft/manual-upload-edit-draft.component';
import { ManualUploadFailedRecordsComponent } from './manual-upload-failed-records/manual-upload-failed-records.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ManualUploadNewApplicationComponent } from './manual-upload-new-application/manual-upload-new-application.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CoreModule,
    ReactiveFormsModule,
    ApiServerModule,
    SharedHeaderSidebarModule,
    SharedSharedFormsModule,
    NgSelectModule,
    DataTablesModule,
    SharedSharedComponentsModule,
    NgxMaskModule.forRoot(),
    RouterModule,
    TranslateModule.forChild(),
    NgxSpinnerModule
  ],
  exports: [
    ManualUploadStep3Component,
    ManualUploadEditDraftComponent
  ],
  providers: [AuthGuard],
  declarations: [
    ManualUploadStep1Component,
    ManualUploadStep2Component,
    ManualUploadStep3Component,
    ManualUploadStep4Component,
    ProcessingComponent,
    SubmissionStatusComponent,
    ManualUploadEditDraftComponent,
    ManualUploadFailedRecordsComponent,
    ManualUploadNewApplicationComponent
  ],
})
export class FeatureManualUploadNoRoutingModule {}
