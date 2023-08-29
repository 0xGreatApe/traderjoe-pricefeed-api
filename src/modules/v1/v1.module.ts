import { Module } from '@nestjs/common';
import { AppController } from './v1.controller';
import { AppService } from './v1.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
