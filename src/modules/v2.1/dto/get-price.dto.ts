// DTO
import { ApiProperty } from '@nestjs/swagger';

export class GetPriceDto {
  @ApiProperty()
  baseAsset: string;

  @ApiProperty()
  quoteAsset: string;
}