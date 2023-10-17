import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('account')
@Controller('account')
export class AccountController {
    constructor(private readonly appService: AppService) { }
    @Post('changepassword-post')
    changePassword(): string {
        return this.appService.loadData('account/changepassword-post');
    }
    @Post('profile-post')
    profliePost(): string {
        return this.appService.loadData('account/profile-post');
    }
    @Get('profile-initiate')
    profileInitiate(): string {
        return  this.appService.loadData('account/profile-initiate');
    }
}
