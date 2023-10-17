import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SharedDashboardComponent } from './dashboard/dashboard.component';
import { CoreModule } from '@fan-id/core';
import { ApiServerModule } from '@fan-id/api/server';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DataTablesModule } from 'angular-datatables';
import { TranslateModule } from '@ngx-translate/core';
import { CommonDialogueComponent } from './common-dialogue/common-dialogue.component';
import { SubmitAndCardDetailComponent } from './submit-and-card-detail/submit-and-card-detail.component';
import { CommonErrorModalComponent } from './common-error-modal/common-error-modal.component';
import { CommonSuccessModalComponent } from './common-success-modal/common-success-modal.component';
import { DtGotoComponent } from './dt-goto/dt-goto.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ConfirmRegisterModalComponent } from './confirm-register-modal/confirm-register-modal.component';
import { UpdateInfoAlertModalComponent } from './update-info-alert-modal/update-info-alert-modal.component';
import { CommonConfirmComponent } from './common-confirm/common-confirm.component';
import { BackArrowComponent } from './back-arrow/back-arrow.component';
import { ModalSaveConfirmComponent } from './modal-save-confirm/modal-save-confirm.component';
import { InactiveModalComponent } from './inactive-modal/inactive-modal.component';
import { ColorCardComponent } from './color-card/color-card.component';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { PdfModalComponent } from './pdf-modal/pdf-modal.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxSpinnerModule } from 'ngx-spinner';
import { PrinterSetupComponent } from './printer-setup/printer-setup.component';
import { KnowledgeBaseFabComponent } from './knowledge-base-fab/knowledge-base-fab.component';

@NgModule({
  imports: [
    CommonModule,
    ApiServerModule,
    ReactiveFormsModule,
    FormsModule,
    CoreModule,
    DataTablesModule,
    NgSelectModule,
    TranslateModule.forChild(),
    NgxMaskModule,
    PdfViewerModule,
    NgxSpinnerModule
  ],
  declarations: [
    SharedDashboardComponent,
    CommonDialogueComponent,
    SubmitAndCardDetailComponent,
    CommonErrorModalComponent,
    CommonSuccessModalComponent,
    DtGotoComponent,
    ConfirmRegisterModalComponent,
    UpdateInfoAlertModalComponent,
    CommonConfirmComponent,
    BackArrowComponent,
    ModalSaveConfirmComponent,
    InactiveModalComponent,
    ColorCardComponent,
    ImageModalComponent,
    PdfModalComponent,
    PrinterSetupComponent,
    KnowledgeBaseFabComponent,
  ],
  exports: [
    SharedDashboardComponent,
    CommonDialogueComponent,
    SubmitAndCardDetailComponent,
    CommonErrorModalComponent,
    CommonSuccessModalComponent,
    DtGotoComponent,
    ConfirmRegisterModalComponent,
    UpdateInfoAlertModalComponent,
    CommonConfirmComponent,
    BackArrowComponent,
    ModalSaveConfirmComponent,
    InactiveModalComponent,
    ColorCardComponent,
    ImageModalComponent,
    PdfModalComponent
  ],
  providers: [DatePipe],
})
export class SharedSharedComponentsModule {}
