import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('bulk-group')
@Controller('bulk-group')
export class BulkGroupController {
  constructor(private readonly appService: AppService) { }

  @Get('bulkgroups')
  bulkgroups(): string {
    return this.appService.loadData('bulk-group/bulkgroups');
  }

  @Get('bulkgroupdata')
  bulkgroupdata(): string {
    return this.appService.loadData('bulk-group/bulkgroupdata');
  }

  @Get('applicationstatistics')
  applicationstatistics(): string {
    return this.appService.loadData('bulk-group/applicationstatistics');
  }
  @Get('columntofilter')
  columntofilter(): string {
    return this.appService.loadData('bulk-group/columntofilter');
  }

  @Get('allapplicationdata')
  allapplicationdata(): string {
    return this.appService.loadData('bulk-group/allapplicationdata');
  }

  @Post('filterwithbulkgroup')
  filterwithbulkgroup(): string {
    return this.appService.loadData('bulk-group/bulkgroupdata');
  }
  @Post('filterwithcolumn')
  filterwithcolumn(): string {
    return this.appService.loadData('bulk-group/allapplicationdata');
  }
}
