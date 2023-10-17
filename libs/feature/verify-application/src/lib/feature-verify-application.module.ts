import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ApiServerModule, ApplicantDetailResolver, MetadataResolver } from '@fan-id/api/server';
import { DataTablesModule } from 'angular-datatables';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { VerifyApplicationListComponent } from './verify-application-list/verify-application-list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { VerifyApplicationEditComponent } from './verify-appliaction-edit/verify-application-edit.component';
import { VerifyApplicationReturnCorrectionComponent } from './verify-application-return-correction/verify-application-return-correction.component';
import { CoreModule } from '@fan-id/core';
const routes:Routes =[
  {
    path:'',
    component:VerifyApplicationListComponent
  },
  {
    path: 'edit',
    component: VerifyApplicationEditComponent,
    resolve: {
      metadata: MetadataResolver,
      applicantDetail: ApplicantDetailResolver
    },
  }
]
@NgModule({
  imports: [CommonModule,
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
    VerifyApplicationListComponent,
    VerifyApplicationEditComponent,
    VerifyApplicationReturnCorrectionComponent
  ],
})
export class FeatureVerifyApplicationModule {}
