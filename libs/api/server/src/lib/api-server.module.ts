import { OcrService } from './services/ocr.service';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from './services/account.service';
import { BulkGroupService } from './services/bulk-group.service';
import { BulkRegistrationService } from './services/bulk-registration.service';
import { AllApplicationsService } from './services/all-applications.service';
import { MetadataService } from './services/metadata.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    AuthService,
    DashboardService,
    AccountService,
    OcrService,
    BulkGroupService,
    BulkRegistrationService,
    AllApplicationsService,
    MetadataService
  ],
})
export class ApiServerModule {}
