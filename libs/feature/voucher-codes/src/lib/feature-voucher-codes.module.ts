import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { GenerateVoucherCodeComponent } from './generate-voucher-code/generate-voucher-code.component';
import { AuthGuard } from '@fan-id/feature/auth';
import { TranslateModule } from '@ngx-translate/core';
import { SharedHeaderSidebarModule } from '@fan-id/shared/header-sidebar';
import { ApiServerModule } from '@fan-id/api/server';
import { CoreModule, CustomDateParserFormatter } from '@fan-id/core';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { VoucherExportDialogComponent } from './voucher-export-dialog/voucher-export-dialog.component';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalWrapperComponent } from 'libs/shared/shared-forms/src/lib/form-manual-components';
import { SharedSharedFormsModule } from '@fan-id/shared/shared-forms';
import { VoucherExcelUploadStatusComponent } from './voucher-excel-upload-status/voucher-excel-upload-status.component';
import { UpdateEmailidComponent } from './update-emailid/update-emailid.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'generate',
        children: [
          {
            path: '',
            component: GenerateVoucherCodeComponent,
            canActivate: [AuthGuard],
          },
        ],
      },
    ],
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TranslateModule.forChild(),
    SharedHeaderSidebarModule,
    ApiServerModule,
    NgSelectModule,
    DataTablesModule,
    CoreModule,
    ReactiveFormsModule,
    FormsModule,
    SharedSharedComponentsModule,
    NgbModule,
    // ModalWrapperComponent,
    SharedSharedFormsModule,
    NgxMaskModule,

  ],
  declarations: [
    GenerateVoucherCodeComponent,
    VoucherExportDialogComponent,
    VoucherExcelUploadStatusComponent,
    UpdateEmailidComponent,
    // ModalWrapperComponent
  ],
  exports: [
    GenerateVoucherCodeComponent,
    // ModalWrapperComponent
  ],
  providers: [
    AuthGuard,
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
})
export class FeatureVoucherCodesModule {}
