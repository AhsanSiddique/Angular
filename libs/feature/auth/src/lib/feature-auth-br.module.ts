import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { TranslateModule } from '@ngx-translate/core';
import {  NgModule } from '@angular/core';
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
import { FeatureAuthModule } from './feature-auth.module';
import { SharedAuthModule } from './shared-auth.module';
import { OrganizationSignupComponent } from './organization-signup/organization-signup.component';
 import { TagInputModule } from 'ngx-chips';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
        component:ForgotPasswordOtpComponent,
        data: { page: 'ForgetPassword', layoutVertical: true },
      },
      {
        path: 'signup',
        component: RegisterComponent,
        data: { page: 'SignUp', layoutVertical: false , isHeader: true, isInfo:true,IsCenterAlign:true},
      },
      {
        path: 'orgsignup',
        component: OrganizationSignupComponent,
        data: { page: 'OrgSignup', layoutVertical: false , isHeader: true, isInfo:true,IsCenterAlign:true},
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
    FormsModule,
    ReactiveFormsModule,
    ApiServerModule,
    TranslateModule.forChild(),
    SharedHeaderSidebarModule,
    SharedSharedComponentsModule,
    NgSelectModule,
    CoreModule,
    SharedAuthModule,
     TagInputModule,
    // BrowserAnimationsModule
  ],
  declarations: [


    OrganizationSignupComponent
  ],
})
export class FeatureAuthBrModule { }



