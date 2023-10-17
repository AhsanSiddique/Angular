import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NewCustomerComponent } from './new-customer/new-customer.component';

import { AuthGuard } from '@fan-id/feature/auth';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiServerModule, MetadataResolver } from '@fan-id/api/server';
import { CoreModule } from '@fan-id/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';

import { NgOtpInputModule } from 'ng-otp-input';
import { CountdownModule } from 'ngx-countdown';
import { AccountOtpDialogComponent } from './account-otp-dialog/account-otp-dialog.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { NgxSpinnerModule } from 'ngx-spinner';

const routes: Routes = [
  {
    path: '',
    component: NewCustomerComponent,
    resolve: {
      metadata: MetadataResolver
    },
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [
    CommonModule,
    SharedHeaderSidebarModule,
    SharedSharedFormsModule,
    ApiServerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CoreModule,
    NgOtpInputModule,
    CountdownModule ,
    SharedSharedComponentsModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    NgxSpinnerModule
  ],
  exports: [],
  providers: [AuthGuard],
  declarations: [NewCustomerComponent, AccountOtpDialogComponent],
})
export class FeatureNewCustomerModule {}
