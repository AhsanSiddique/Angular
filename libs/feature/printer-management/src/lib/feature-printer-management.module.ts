import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrinterListComponent } from './printer-list/printer-list.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@fan-id/feature/auth';
import { ApiServerModule } from '@fan-id/api/server';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DataTablesModule } from 'angular-datatables';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { TranslateModule } from '@ngx-translate/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { PrinterManagementCreateOrUpdateComponent } from './printer-management-create-or-update/printer-management-create-or-update.component';
const routes:Routes =[
  {
    path:'',
    children:[ {
      path:'list',
      component:PrinterListComponent,
      canActivate: [AuthGuard]
      },
      {
        path:'create-or-update',
        component:PrinterManagementCreateOrUpdateComponent,
        canActivate: [AuthGuard]
      }
    ]
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
    SharedSharedFormsModule
  ],
  declarations: [
    PrinterListComponent,
    PrinterManagementCreateOrUpdateComponent
  ],
})
export class FeaturePrinterManagementModule {}
