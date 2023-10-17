import { TranslateModule } from '@ngx-translate/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CoreModule } from '@fan-id/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { ProfileComponent } from './profile/profile.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    CoreModule,
    ReactiveFormsModule,
    FormsModule,
    SharedSharedComponentsModule,
    SharedSharedFormsModule,
    TranslateModule.forChild(),
  ],
  declarations: [ProfileComponent, ChangePasswordComponent],
})
export class FeatureAccountModule {}
