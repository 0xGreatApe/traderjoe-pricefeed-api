import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('v2')
export class AppController {
  constructor(private readonly appService: AppService) {}
}
