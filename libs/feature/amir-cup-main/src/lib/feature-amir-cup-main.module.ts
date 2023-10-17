import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedPortalCommonModule} from '@fan-id/shared/portal-common';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@fan-id/core';


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path:'dashboard',
        component:DashboardComponent
      },
      {
        path:'profile',
        component:ProfileComponent,
      },
      {
        path:'change-password',
        component:ChangePasswordComponent
      },
      {
        path:'',
        redirectTo:'dashboard'
      }
     //add other routes here
    ],
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedPortalCommonModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    CoreModule
  ],
  declarations: [
    MainLayoutComponent,
    DashboardComponent,
    ProfileComponent,
    ChangePasswordComponent
  ],
})
export class FeatureAmirCupMainModule {}
