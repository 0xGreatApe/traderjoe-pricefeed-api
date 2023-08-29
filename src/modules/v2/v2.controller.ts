import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './v2.service';

@Controller('v2')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("/prices/:baseAsset/:quoteAsset/:binstep")
  getBaseAssetPrice(
    @Param('baseAsset') baseAsset: string,
    @Param('quoteAsset') quoteAsset: string,
    @Param('binstep') binStep: number) {
    return this.appService.getBasePrice(baseAsset, quoteAsset, binStep);
  }


}
