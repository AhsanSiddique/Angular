import { TranslateModule } from '@ngx-translate/core';
import { FeatureAccountModule } from '@fan-id/feature/account';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkRegistrationComponent } from './bulk-registration/bulk-registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { CoreModule } from '@fan-id/core';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { ApiServerModule } from '@fan-id/api/server';
import { AuthGuard } from '@fan-id/feature/auth';
import { RegistrationComponent } from './registration/registration.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { FeatureManualUploadModule } from '@fan-id/feature/manual-upload';
import { FeatureBulkUploadModule } from '@fan-id/feature/bulk-upload';
import { FeatureAllApplicationsModule } from '@fan-id/feature/all-applications';
import { FeatureVoucherCodesModule } from '@fan-id/feature/voucher-codes';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { PlatformSyncComponent } from './platform-sync/platform-sync.component';
const routes: Routes = [
  {
    path: '',
    component: BulkRegistrationComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'bulk-registration',
        children: [
          {
            path: '',
            component: RegistrationComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'upload',
            loadChildren: () =>
              import('@fan-id/feature/bulk-upload').then(
                (module) => module.FeatureBulkUploadModule
              ),
            canActivate: [AuthGuard],
          },
          {
            path: 'manual-registration',
            loadChildren: () =>
              import('@fan-id/feature/manual-upload').then(
                (module) => module.FeatureManualUploadModule
              ),
            canActivate: [AuthGuard],
          },
          {
            path: 'package-upload',
            loadChildren: () =>
              import('@fan-id/feature/package-upload').then(
                (module) => module.FeaturePackageUploadModule
              ),
            canActivate: [AuthGuard],
          },
        ],
      },
      {
        path: 'account',
        loadChildren: () =>
          import('@fan-id/feature/account').then(
            (module) => module.FeatureAccountModule
          ),
      },
      {
        path: 'bulk-groups',
        loadChildren: () =>
          import('@fan-id/feature/bulk-group').then(
            (module) => module.FeatureBulkGroupModule
          ),
      },
      {
        path: 'all-applications',
        loadChildren: () =>
          import('@fan-id/feature/all-applications').then(
            (module) => module.FeatureAllApplicationsModule
          ),
      },
      {
        path: 'voucher-codes',
        loadChildren: () =>
          import('@fan-id/feature/voucher-codes').then(
            (module) => module.FeatureVoucherCodesModule
          ),
      },
      {
        path: 'organization',
        loadChildren: () =>
          import('@fan-id/feature/organization').then(
            (module) => module.FeatureOrganizationModule
          ),
      },
      {
        path: 'knowledge-base',
        loadChildren:() => import('@fan-id/feature/knowledge-base').then(
          (module) => module.FeatureKnowledgeBaseModule
        )
      },
      {
        path: 'payments',
        loadChildren: () => import('@fan-id/feature/payment').then(
          (module) => module.FeaturePaymentModule
        )
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedHeaderSidebarModule,
    FeatureAccountModule,
    FeatureManualUploadModule,
    FeatureAllApplicationsModule,
    ApiServerModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    DataTablesModule,
    NgSelectModule,
    FeatureBulkUploadModule,
    TranslateModule.forChild(),
    SharedSharedComponentsModule,
    FeatureVoucherCodesModule
  ],
  declarations: [
    BulkRegistrationComponent,
    DashboardComponent,
    RegistrationComponent,
    PlatformSyncComponent,
  ],
  providers: [AuthGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class FeatureBulkRegistrationModule {}
