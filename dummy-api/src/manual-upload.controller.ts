import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('manual-upload')
@Controller('manual-upload')
export class ManualUploadController {
  constructor(private readonly appService: AppService) {}

  @Get('fan-categories')
  fanCategories(): string {
    return this.appService.loadData('manual-registration/fan-categories');
  }

  @Get('countries')
  countries(): string {
    return this.appService.loadData('manual-registration/countries');
  }

  @Get('professions')
  professions(): string {
    return this.appService.loadData('manual-registration/professions');
  }

  @Get('phonecodes')
  phonecodes(): string {
    return this.appService.loadData('manual-registration/phonecodes');
  }

  @Get('titles')
  titles(): string {
    return this.appService.loadData('manual-registration/titles');
  }

  @Get('medicals')
  medicals(): string {
    return this.appService.loadData('manual-registration/medicals');
  }

  @Get('user-categories')
  userCategories(): string {
    return this.appService.loadData('manual-registration/user-categories');
  }

  @Post('manualregister')
  manualregister(): string {
    return this.appService.loadData('manual-registration/manual-register');
  }

  @Post('uploadmanualdata')
  uploadManualData(): string {
    return this.appService.loadData('manual-registration/manualupload');
  }
  @Get('importheaderdetails')
  importheaderdetails(): string {
    return this.appService.loadData('manual-registration/manualupload');
  }

  @Get('bulkimport')
  bulkimport(): string {
    return this.appService.loadData('manual-registration/bulkimport');
  }

  @Post('postimporteddata')
  postimporteddata(): string {
    return this.appService.loadData('manual-registration/toprocess');
  }

  @Get('submittedstatus')
  submittedstatus(): string {
    return this.appService.loadData('manual-registration/submittedstatus');
  }
}
