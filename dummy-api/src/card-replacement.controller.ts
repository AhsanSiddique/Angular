import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('card-replacement')
@Controller('card-replacement')
export class CardReplacementController {
  constructor(private readonly appService: AppService) {}
  @Get('cardReplacementFiteredData')
  allapplicationdata(): string {
    return this.appService.loadData(
      'card-replacement/cardReplacementFiteredData',
    );
  }

  @Get('cardReplacementcolumntofilter')
  columntofilter(): string {
    return this.appService.loadData(
      'card-replacement/cardReplacementcolumntofilter',
    );
  }
  @Get('CardReplacementApplicantData')
  applicantdata(): string {
    return this.appService.loadData(
      'card-replacement/cardReplacementApplicantData',
    );
  }
}
