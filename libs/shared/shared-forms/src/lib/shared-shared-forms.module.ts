import { SharedSharedComponentsModule } from '@fan-id/shared/shared-components';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { CoreModule, CustomDateParserFormatter } from '@fan-id/core';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import {
  ModalWrapperComponent,
  FormNoteComponent,
  UploadDocumentFormComponent,
  AddressInformationFormComponent,
  ApplicationFormComponent,
  PersonalInformationFormComponent,
  TermsAndConditionsComponent,
  TermsConditionsFormComponent,
  DeliveryInformationFormComponent,
  EmergencyContactFormComponent,
  FormFieldErrorComponent,
} from './form-manual-components';
import {
  ApplicationDetailsComponent,
  DocumentDetailsComponent,
  PersonalDetailsComponent,
  AddressDetailsComponent,
  DeliveryDetailsComponent,
  ReadonlyInputComponent,
  CardDetailsComponent,
  IntegrationStatusComponent,
  EmergencyContactDetailsComponent,
} from './applicant-details-components';
import { NgbDateParserFormatter, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ImageCroppperComponent } from './form-manual-components/image-croppper/image-croppper.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { DependentDetailsComponent } from './applicant-details-components/dependent-details/dependent-details.component';
import { PreferredCollectionPointComponent } from './form-manual-components/preferred-collection-point/preferred-collection-point.component';
import { ApplicationFormLocalComponent } from './form-manual-components/application-form-local/application-form-local.component';
import { UploadDocumentFormLocalComponent } from './form-manual-components/upload-document-form-local/upload-document-form-local.component';
import { PreferredCollectionDetailsComponent } from './applicant-details-components/preferred-collection-details/preferred-collection-details.component';
import { PersonalDetailsLocalComponent } from './applicant-details-components/personal-details-local/personal-details-local.component';
import { PersonalInformationFormLocalComponent } from './form-manual-components/personal-information-form-local/personal-information-form-local.component';
import { ApplicationHistoryComponent } from './applicant-details-components/application-history/application-history.component';
import { EntryPermitHistoryComponent } from './applicant-details-components/entry-permit-history/entry-permit-history.component';
import { TicketInformationFormComponent } from './form-manual-components/ticket-information-form/ticket-information-form.component';
import { CardChoiceFormComponent } from './form-manual-components/card-choice-form/card-choice-form.component';
import { OrgAccommodationDetailsComponent } from './applicant-details-components/org-accommodation-details/org-accommodation-details.component';
import { DataTablesModule } from 'angular-datatables';
import { ResidencyInformationComponent } from './form-manual-components/residency-information/residency-information.component';
import { AccommodationInformationFormComponent } from './form-manual-components/accommodation-information-form/accommodation-information-form.component';
import { ResidencyDetailsComponent } from './applicant-details-components/residency-details/residency-details.component';
import { AccommodationDetailsComponent } from './applicant-details-components/accommodation-details/accommodation-details.component';
import { ResidencyInformationBrComponent } from './form-manual-components/residency-information-br/residency-information-br.component';
import { ContactInformationFormComponent } from './form-manual-components/contact-information-form/contact-information-form.component';
import { ResidencyDetailsBrComponent } from './applicant-details-components/residency-details-br/residency-details-br.component';
import { ContactDetailsBrComponent } from './applicant-details-components/contact-details-br/contact-details-br.component';
import { AccreditationFormComponent } from './form-manual-components/accreditation-form/accreditation-form.component';
import { VisaDetailsComponent } from './applicant-details-components/visa-details/visa-details.component';
import { PaymentDetailsComponent } from './applicant-details-components/payment-details/payment-details.component';
import { AccreditationDetailsComponent } from './applicant-details-components/accreditation-details/accreditation-details.component';
@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    RouterModule,
    TranslateModule.forChild(),
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxMaskModule,
    NgbModule,
    SharedSharedComponentsModule,
    ImageCropperModule,
    DataTablesModule

  ],
  declarations: [
    ApplicationFormComponent,
    UploadDocumentFormComponent,
    PersonalInformationFormComponent,
    AddressInformationFormComponent,
    TermsConditionsFormComponent,
    TermsAndConditionsComponent,
    FormNoteComponent,
    ModalWrapperComponent,
    ApplicationDetailsComponent,
    DocumentDetailsComponent,
    PersonalDetailsComponent,
    AddressDetailsComponent,
    DeliveryDetailsComponent,
    ReadonlyInputComponent,
    DeliveryInformationFormComponent,
    CardDetailsComponent,
    IntegrationStatusComponent,
    EmergencyContactFormComponent,
    EmergencyContactDetailsComponent,
    FormFieldErrorComponent,
    ImageCroppperComponent,
    DependentDetailsComponent,
    PreferredCollectionPointComponent,
    ApplicationFormLocalComponent,
    UploadDocumentFormLocalComponent,
    PreferredCollectionDetailsComponent,
    PersonalDetailsLocalComponent,
    PersonalInformationFormLocalComponent,
    ApplicationHistoryComponent,
    EntryPermitHistoryComponent,
    TicketInformationFormComponent,
    CardChoiceFormComponent,
    OrgAccommodationDetailsComponent,
    ResidencyInformationComponent,
    AccommodationInformationFormComponent,
    ResidencyDetailsComponent,
    AccommodationDetailsComponent,
    ResidencyInformationBrComponent,
    ContactInformationFormComponent,
    ResidencyDetailsBrComponent,
    ContactDetailsBrComponent,
    AccreditationFormComponent,
    VisaDetailsComponent,
    PaymentDetailsComponent,
    AccreditationDetailsComponent
  ],
  exports: [
    ApplicationFormComponent,
    UploadDocumentFormComponent,
    PersonalInformationFormComponent,
    AddressInformationFormComponent,
    TermsConditionsFormComponent,
    TermsAndConditionsComponent,
    FormNoteComponent,
    ModalWrapperComponent,
    ApplicationDetailsComponent,
    DocumentDetailsComponent,
    PersonalDetailsComponent,
    AddressDetailsComponent,
    DeliveryDetailsComponent,
    ReadonlyInputComponent,
    DeliveryInformationFormComponent,
    CardDetailsComponent,
    IntegrationStatusComponent,
    EmergencyContactFormComponent,
    EmergencyContactDetailsComponent,
    FormFieldErrorComponent,
    DependentDetailsComponent,
    PreferredCollectionPointComponent,
    ApplicationFormLocalComponent,
    UploadDocumentFormLocalComponent,
    PreferredCollectionDetailsComponent,
    PersonalDetailsLocalComponent,
    PersonalInformationFormLocalComponent,
    ApplicationHistoryComponent,
    EntryPermitHistoryComponent,
    TicketInformationFormComponent,
    CardChoiceFormComponent,
    OrgAccommodationDetailsComponent,
    ImageCroppperComponent,
    ResidencyInformationComponent,
    AccommodationInformationFormComponent,
    ResidencyDetailsComponent,
    AccommodationDetailsComponent,
    ResidencyInformationBrComponent,
    ContactInformationFormComponent,
    ResidencyDetailsBrComponent,
    ContactDetailsBrComponent,
    AccreditationFormComponent,
    VisaDetailsComponent,
    PaymentDetailsComponent,
    AccreditationDetailsComponent,
  ],
  providers: [
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter },
  ],
})
export class SharedSharedFormsModule {}
