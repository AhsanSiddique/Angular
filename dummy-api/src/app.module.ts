import { CardPickupController } from './card-pickup.controller';
import { ManualUploadController } from './manual-upload.controller';
import { DashboardController } from './dashboard.controller';
import { BulkUploadController } from './bulk-upload.controller';
import { AuthController } from './auth.controller';
import { AccountController } from './account.controller';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BulkGroupController } from './bulk-group.controller';
import { AllApplicationsController } from './all-applications.controller';
import { CardReplacementController } from './card-replacement.controller';

@Module({
  imports: [],
  controllers: [
    CardPickupController,
    ManualUploadController,
    DashboardController,
    BulkUploadController,
    AllApplicationsController,
    CardReplacementController,
    AuthController,
    AccountController,
    AppController,
    BulkGroupController,
  ],
  providers: [AppService],
})
export class AppModule {}
