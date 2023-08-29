import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('v1')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/totalpairs')
  getTotalPairs() {
    return this.appService.getTotalPairs();
  }

  @Get('/prices/:baseAsset/:quoteAsset')
  async getBaseAssetPrice(
    @Param('baseAsset') baseAsset: string, 
    @Param('quoteAsset') quoteAsset: string) {
      return this.appService.getBasePrice(baseAsset, quoteAsset);
  };
}
