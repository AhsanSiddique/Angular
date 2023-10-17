import { Controller, Get, Post, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly appService: AppService) {}
  @Get('statistics')
  statistics(): string {
    return this.appService.loadData('dashboard/statistics');
  }

  @Get('events')
  events(): string {
    return this.appService.loadData('dashboard/events');
  }
}
