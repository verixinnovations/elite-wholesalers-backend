import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsString,
  Min,
  ValidateNested,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';

export enum Currency {
  AUD = 'AUD',
  USD = 'USD',
  NGN = 'NGN',
}

export class PriceDto {
  @ApiProperty({ example: 120.5 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: Currency, example: Currency.AUD })
  @IsEnum(Currency)
  currency: Currency;
}

export class CreateCartDto {
  @ApiProperty({ required: true, example: '1969240000001034033' })
  @IsString()
  @IsNotEmpty()
  item_id: string;

  @ApiProperty({ default: 1, example: 1 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity = 1;

  // 2. Use ValidateNested for the nested object
  @ApiProperty({ type: () => PriceDto })
  @ValidateNested()
  @Type(() => PriceDto)
  price: PriceDto;
}
