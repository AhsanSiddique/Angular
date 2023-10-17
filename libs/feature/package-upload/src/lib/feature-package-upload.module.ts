import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageUploadStep1Component } from './package-upload-step1/package-upload-step1.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@fan-id/feature/auth';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CoreModule } from '@fan-id/core';
import { MetadataResolver } from '@fan-id/api/server';
import { PackageUploadStep2Component } from './package-upload-step2/package-upload-step2.component';
import { DataTablesModule } from 'angular-datatables';
import { TranslateModule } from '@ngx-translate/core';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PackageUploadDeleteComponent } from './package-upload-delete/package-upload-delete.component';
import { PackageUploadSubmissionStatusComponent } from './package-upload-submission-status/package-upload-submission-status.component';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { ExcelUploadStep2Component } from './excel-upload-step2/excel-upload-step2.component';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'step-1',
        component: PackageUploadStep1Component,
        resolve: {
          metadata: MetadataResolver
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'step-2',
        component: PackageUploadStep2Component,
        resolve: {
          metadata: MetadataResolver
        },
        canActivate: [AuthGuard],
      },
      {
        path: 'excel-step-2',
        component: ExcelUploadStep2Component,
        resolve: {
          metadata: MetadataResolver
        },
        canActivate: [AuthGuard],
      },
    ]
  }
]
@NgModule({
  imports: [CommonModule,
    SharedSharedComponentsModule,
    SharedSharedFormsModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CoreModule,
    DataTablesModule,
    TranslateModule.forChild(),
    NgxSpinnerModule,
    SharedHeaderSidebarModule
  ],
  declarations: [
    PackageUploadStep1Component,
    PackageUploadStep2Component,
    PackageUploadDeleteComponent,
    PackageUploadSubmissionStatusComponent,
    ExcelUploadStep2Component
  ],
  providers: [AuthGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class FeaturePackageUploadModule {}
