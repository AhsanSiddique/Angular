import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('card-pickup')
@Controller('card-pickup')
export class CardPickupController {
  constructor(private readonly appService: AppService) {}
  @Get('cardPickupData')
  allapplicationdata(): string {
    return this.appService.loadData('card-pickup/cardListData');
  }

  @Get('cardPickupFilter')
  columntofilter(): string {
    return this.appService.loadData('card-pickup/cardListFilter');
  }
  @Get('CardReplacementApplicantData')
  applicantdata(): string {
    return this.appService.loadData('card-pickup/CardReplacementApplicantData');
  }
  @Post('CardPrintLIst')
  printList(): string {
    return this.appService.loadData('card-pickup/cardPrintList');
  }
}
