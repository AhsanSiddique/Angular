import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from '@fan-id/feature/auth';
import { RouterModule, Routes } from '@angular/router';
import { AllApplicationsListComponent } from './all-applications-list/all-applications-list.component';
import { ApplicantDetailsComponent } from './applicant-details/applicant-details.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiServerModule, ApplicantDetailResolver, MetadataResolver } from '@fan-id/api/server';
import { CoreModule } from '@fan-id/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { EditApplicationDetailComponent } from './edit-application-detail/edit-application-detail.component';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { EditApplicationDetailLocalComponent } from './edit-application-detail-local/edit-application-detail-local.component';
import { EditApplicationGuard } from './edit-application.guard';
import { AllApplicationsExportComponent } from './all-applications-export/all-applications-export.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ApplicationHistoryViewComponent } from './application-history-view/application-history-view.component';
import { UpdateMobileNumberComponent } from './update-mobile-number/update-mobile-number.component';
import { UpdateProfileImageComponent } from './update-profile-image/update-profile-image.component';
import { UpdateFanCategoryComponent } from './update-fan-category/update-fan-category.component';
import { UpdateEmailComponent } from './update-email/update-email.component';
const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        children: [
          {
            path: '',
            component: AllApplicationsListComponent,
            canActivate: [AuthGuard],
          },
          {
            path: 'applicant-details',
            canActivate: [AuthGuard],

            children: [
              {
                path: '',
                component: ApplicantDetailsComponent,
                resolve: {
                  applicantDetail: ApplicantDetailResolver
                },
              },
              {
                path: 'edit',
                component: EditApplicationDetailComponent,
                canActivate:[EditApplicationGuard],
                resolve: {
                  metadata: MetadataResolver,
                  applicantDetail: ApplicantDetailResolver
                },
              },
              {
                path: 'edit-domestic',
                component: EditApplicationDetailLocalComponent,
                resolve: {
                  metadata: MetadataResolver,
                  applicantDetail: ApplicantDetailResolver
                },
              },
              {
                path: 'application-history',
                component: ApplicationHistoryViewComponent,
                resolve: {
                  metadata: MetadataResolver,
                  applicantDetail: ApplicantDetailResolver
                },
              },
            ],
          },
          {
            path: 'dependent-applicant-details',
            canActivate: [AuthGuard],

            children: [
              {
                path: '',
                component: ApplicantDetailsComponent,
                resolve: {
                  applicantDetail: ApplicantDetailResolver
                },
              },
              {
                path: 'edit',
                component: EditApplicationDetailComponent,
                resolve: {
                  metadata: MetadataResolver,
                  applicantDetail: ApplicantDetailResolver
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    DataTablesModule,
    SharedHeaderSidebarModule,
    SharedSharedFormsModule,
    ApiServerModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DataTablesModule,
    CoreModule,
    SharedSharedComponentsModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    NgxPaginationModule,
    NgbModule,
    NgxSpinnerModule
  ],
  declarations: [
    AllApplicationsListComponent,
    ApplicantDetailsComponent,
    // SubmitAndCardDetailComponent,
    EditApplicationDetailComponent,
    EditApplicationDetailLocalComponent,
    AllApplicationsExportComponent,
    ApplicationHistoryViewComponent,
    UpdateMobileNumberComponent,
    UpdateProfileImageComponent,
    UpdateFanCategoryComponent,
    UpdateEmailComponent,
  ]
})
export class FeatureAllApplicationsModule {}
