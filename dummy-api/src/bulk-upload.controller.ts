import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('bulk-upload')
@Controller('bulk-upload')
export class BulkUploadController {
  constructor(private readonly appService: AppService) { }

  @Get('events')
  events(): string {
    return this.appService.loadData('dashboard/events');
  }

  @Get('organizations')
  organizations(): string {
    return this.appService.loadData('bulk-registration/organizations');
  }

  @Get('servicecentres')
  servicecentres(): string {
    return this.appService.loadData('bulk-registration/servicecentres');
  }

  @Post('uploadexcel')
  uploadexcel(): string {
    return this.appService.loadData('bulk-registration/uploadexcel');
  }

  @Get('importheaderdetails')
  importheaderdetails(): string {
    return this.appService.loadData('bulk-registration/uploadexcel');
  }

  @Get('bulkimport')
  bulkimport(): string {
    return this.appService.loadData('bulk-registration/bulkimport');
  }

  @Post('postimporteddata')
  postimporteddata(): string {
    return this.appService.loadData('bulk-registration/toprocess');
  }

  @Get('submittedstatus')
  submittedstatus(): string {
    return this.appService.loadData('bulk-registration/submittedstatus');
  }
}
