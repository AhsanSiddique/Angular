import { Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly appService: AppService) {}
  @Post('login')
  logon(): string {
    return this.appService.loadData('auth/login');
  }
  @Post('terminallist')
  terminallist(): string {
    return this.appService.loadData('auth/terminallist');
  }
}
