import { SharedDashboardComponent } from './../../../../shared/shared-components/src/lib/dashboard/dashboard.component';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
  NO_ERRORS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCenterComponent } from './service-center/service-center.component';
import { DasboardComponent } from './dasboard/dasboard.component';

import { TranslateModule } from '@ngx-translate/core';
import { FeatureAccountModule } from '@fan-id/feature/account';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { CoreModule } from '@fan-id/core';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { ApiServerModule } from '@fan-id/api/server';
import { AuthGuard } from '@fan-id/feature/auth';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { FeatureManualUploadModule } from '@fan-id/feature/manual-upload';
import { FeatureBulkUploadModule } from '@fan-id/feature/bulk-upload';
import { FeatureAllApplicationsModule } from '@fan-id/feature/all-applications';
import { FeatureNewCustomerModule } from '@fan-id/feature/new-customer';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { FeatureCardReplacementModule } from '@fan-id/feature/card-replacement';

const routes: Routes = [
  {
    path: '',
    component: ServiceCenterComponent,
    children: [
      {
        path: 'dashboard',
        component: DasboardComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'account',
        loadChildren: () =>
          import('@fan-id/feature/account').then(
            (module) => module.FeatureAccountModule
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
        path: 'new-customer',
        loadChildren: () =>
          import('@fan-id/feature/new-customer').then(
            (module) => module.FeatureNewCustomerModule
          ),
      },
      {
        path: 'card-pickup',
        loadChildren: () =>
          import('@fan-id/feature/card-pickup').then(
            (module) => module.FeatureCardPickupModule
          ),
      },
      {
        path: 'card-replacement',
        loadChildren: () =>
          import('@fan-id/feature/card-replacement').then(
            (module) => module.FeatureCardReplacementModule
          ),
      },
      {
        path:'knowledge-base',
        loadChildren:() => import('@fan-id/feature/knowledge-base').then(
          (module) => module.FeatureKnowledgeBaseModule
        )
      },
      {
        path:'accommodation',
        loadChildren:() => import('@fan-id/feature/accomadation').then(
          (module) => module.FeatureAccomadationModule
        )
      },
      {
        path:'verify-application',
        loadChildren:() => import('@fan-id/feature/verify-application').then(
          (module) => module.FeatureVerifyApplicationModule
        )
      },
      {
        path:'approve-application',
        loadChildren:() => import('@fan-id/feature/approve-application').then(
          (module) => module.FeatureApproveApplicationModule
        )
      },
      {
        path:'verify-accommodation',
        loadChildren:() => import('@fan-id/feature/verify-accommodation').then(
          (module) => module.FeatureVerifyAccommodationModule
        )
      },
      {
        path:'printer-management',
        loadChildren:() => import('@fan-id/feature/printer-management').then(
          (module) => module.FeaturePrinterManagementModule
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
    FeatureNewCustomerModule,
    FeatureCardReplacementModule,
    ApiServerModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    DataTablesModule,
    NgSelectModule,
    FeatureBulkUploadModule,
    TranslateModule.forChild(),
    SharedSharedComponentsModule,
  ],
  declarations: [ServiceCenterComponent, DasboardComponent],
  providers: [AuthGuard],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class FeatureServiceCenterModule {}
