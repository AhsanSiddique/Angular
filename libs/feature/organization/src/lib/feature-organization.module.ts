import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Route } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthGuard } from '@fan-id/feature/auth';
import { DataTablesModule } from 'angular-datatables';
import { CoreModule } from '@fan-id/core';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { OrganizationUsersComponent } from './organization-users/organization-users.component';
import { OnboardingComponent } from './onboarding/onboarding.component';
import { AddUserComponent } from './add-user/add-user.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ManageCountComponent } from './manage-count/manage-count.component';

const routes: Route[] = [
  {
    path: 'all',
    component: OrganizationListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'users',
    component: OrganizationUsersComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    redirectTo: 'all',
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    DataTablesModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    SharedSharedComponentsModule,
    NgSelectModule,

  ],
  declarations: [
    OrganizationListComponent,
    OrganizationUsersComponent,
    OnboardingComponent,
    AddUserComponent,
    ManageCountComponent
  ],
})
export class FeatureOrganizationModule {}
