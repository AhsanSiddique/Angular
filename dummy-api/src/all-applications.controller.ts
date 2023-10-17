import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('all-applications')
@Controller('all-applications')
export class AllApplicationsController {
  constructor(private readonly appService: AppService) {}

  @Get('allapplicationdata')
  allapplicationdata(): string {
    return this.appService.loadData('all-applications/allapplicationdata');
  }

  @Get('columntofilter')
  columntofilter(): string {
    return this.appService.loadData('all-applications/columntofilter');
  }

  @Post('filterwithcolumn')
  filterwithcolumn(): string {
    return this.appService.loadData('all-applications/allapplicationdata');
  }

  @Get('applicantdata')
  applicantdata(): string {
    return this.appService.loadData('all-applications/applicantdata');
  }
}
