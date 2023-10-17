import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { VerifyAccommodationListComponent } from './verify-accommodation-list/verify-accommodation-list.component';
import { CoreModule } from '@fan-id/core';
import { ApiServerModule, ApplicantDetailResolver, MetadataResolver } from '@fan-id/api/server';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { VerifyAccommodationEditComponent } from './verify-accommodation-edit/verify-accommodation-edit.component';
import { VerifyAccommodationUpdateStatusComponent } from './verify-accommodation-update-status/verify-accommodation-update-status.component';
const routes:Routes =[
  {
    path:'',
    component:VerifyAccommodationListComponent
  },
  {
    path: 'edit',
    component: VerifyAccommodationEditComponent,
    resolve: {
      metadata: MetadataResolver,
      applicantDetail: ApplicantDetailResolver
    },
  }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    CoreModule,
    ApiServerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    SharedHeaderSidebarModule,
    SharedSharedComponentsModule,
    TranslateModule.forChild(),
    NgxPaginationModule,
    NgbModule,
    NgxSpinnerModule,
    SharedSharedFormsModule
  ],
  declarations: [
    VerifyAccommodationListComponent,
    VerifyAccommodationEditComponent,
    VerifyAccommodationUpdateStatusComponent
  ],
})
export class FeatureVerifyAccommodationModule {}
