import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManualUploadStep1Component } from './manual-upload-step1/manual-upload-step1.component';
import { ManualUploadStep2Component } from './manual-upload-step2/manual-upload-step2.component';
import { ManualUploadEditDraftComponent } from './manual-upload-edit-draft/manual-upload-edit-draft.component';
import { ManualUploadFailedRecordsComponent } from './manual-upload-failed-records/manual-upload-failed-records.component';

import { MetadataResolver } from '@fan-id/api/server';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@fan-id/feature/auth';
import { FeatureManualUploadNoRoutingModule } from './feature-manual-upload-no-routing.module';
import { ManualUploadNewApplicationComponent } from './manual-upload-new-application/manual-upload-new-application.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'step-1',
        component: ManualUploadStep1Component,
        canActivate: [AuthGuard],
      },
      {
        path: 'step-2',
        component: ManualUploadStep2Component,
        resolve: {
          metadata: MetadataResolver
        },
        canActivate: [AuthGuard],
      },
      // {
      //   path: 'step-3',
      //   component: ManualUploadStep3Component,
      //   canActivate: [AuthGuard],
      // },
      {
        path: 'edit',
        component: ManualUploadEditDraftComponent,
        canActivate: [AuthGuard],
        resolve: {
          metadata: MetadataResolver
        },
      },
      // {
      //   path: 'step-4',
      //   component: ManualUploadStep4Component,
      //   canActivate: [AuthGuard],
      // },
      {
        path: 'failed-records',
        component: ManualUploadFailedRecordsComponent,
        canActivate: [AuthGuard],
        resolve: {
          metadata: MetadataResolver
        },
      },
      {
        path: 'new-application',
        component: ManualUploadNewApplicationComponent,
        canActivate: [AuthGuard],
        resolve: {
          metadata: MetadataResolver
        },
      }
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FeatureManualUploadNoRoutingModule
  ],
  exports: [],
  providers: [AuthGuard]
})
export class FeatureManualUploadModule {}
