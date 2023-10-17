import { HttpClientModule } from '@angular/common/http';
import { SsoguardGuard } from './ssoguard.guard';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { TranslateModule } from '@ngx-translate/core';
import { Component, NgModule, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiServerModule } from '@fan-id/api/server';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { LayoutComponent } from './layout/layout.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { NgSelectModule } from '@ng-select/ng-select';
import { LoginGuard } from './login-guard.guard';
import { CoreModule } from '@fan-id/core';
import { ForgotPasswordOtpComponent } from './forgot-password-otp/forgot-password-otp.component';
import { ResetPasswordOtpComponent } from './reset-password-otp/reset-password-otp.component';
import { RegisterComponent } from './register/register.component';
import { SharedAuthModule } from './shared-auth.module';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginComponent,
        data: { page: 'Login', isHeader: false, includeLangSelector: true },
        canActivate:[LoginGuard]
      },
      {
        path: 'forget-password',
        component: ForgetPasswordComponent,
        data: { page: 'ForgetPassword', layoutVertical: true },
      },
      {
        path: 'reset-password',
        component: ResetPasswordComponent,
        data: { page: 'ResetPassword', layoutVertical: true },
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    ApiServerModule,
    TranslateModule.forChild(),
    SharedHeaderSidebarModule,
    SharedSharedComponentsModule,
    NgSelectModule,
    CoreModule,
    SharedAuthModule,
    HttpClientModule
  ],
  declarations: [

  ],
  exports:[

  ]
})
export class FeatureAuthModule {}
