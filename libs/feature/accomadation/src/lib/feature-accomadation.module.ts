import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AccomadationListComponent } from './accomadation-list/accomadation-list.component';
import { ApiServerModule } from '@fan-id/api/server';
import { DataTablesModule } from 'angular-datatables';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { AccommodationPropertyGuestComponent } from './accommodation-property-guest/accommodation-property-guest.component';
import { QaaComponent } from './qaa/qaa.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AccommodationCancellationComponent } from './accommodation-cancellation/accommodation-cancellation.component';
import { SitaComponent } from './sita/sita.component';
import { AccommodationAlternateComponent } from './accommodation-alternate/accommodation-alternate.component';
import { AccomadationDashboardComponent } from './accomadation-dashboard/accomadation-dashboard.component';
import { AccommodationExportComponent } from './accommodation-export/accommodation-export.component';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { CoreModule } from '@fan-id/core';
import { AccommodationOtherComponent } from './accommodation-other/accommodation-other.component';
import { AccommodationPropertyGuestUpdateDetailsComponent } from './accommodation-property-guest/accommodation-property-guest-update-details/accommodation-property-guest-update-details.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { UpdateHostEmailComponent } from './accommodation-property-guest/update-host-email/update-host-email.component';
import { AccommodationOtherHistoryComponent } from './accommodation-other/accommodation-other-history/accommodation-other-history.component';

const routes:Routes = [
  {
    path:'',
    component: AccomadationListComponent
  },
  {
    path: 'other-accommodation-history',
    component: AccommodationOtherHistoryComponent
  }
]
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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
    SharedSharedFormsModule,
    CoreModule,
    NgxMaskModule
  ],
  declarations: [
    AccomadationListComponent,
    AccommodationPropertyGuestComponent,
    QaaComponent,
    AccommodationCancellationComponent,
    SitaComponent,
    AccommodationAlternateComponent,
    AccomadationDashboardComponent,
    AccommodationExportComponent,
    AccommodationOtherComponent,
    AccommodationPropertyGuestUpdateDetailsComponent,
    UpdateHostEmailComponent,
    AccommodationOtherHistoryComponent
  ],
})
export class FeatureAccomadationModule {}
