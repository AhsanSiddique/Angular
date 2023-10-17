
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

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    ApiServerModule,
    TranslateModule.forChild(),
    SharedHeaderSidebarModule,
    SharedSharedComponentsModule,
    NgSelectModule,
    CoreModule
  ],
  declarations: [
    LoginComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    LayoutComponent,
    ForgotPasswordOtpComponent,
    ResetPasswordOtpComponent,
    RegisterComponent
  ],
  exports:[
    LoginComponent,
    ForgetPasswordComponent,
    ResetPasswordComponent,
    LayoutComponent,
    ForgotPasswordOtpComponent,
    ResetPasswordOtpComponent,
    RegisterComponent
  ]
})
export class SharedAuthModule { }
