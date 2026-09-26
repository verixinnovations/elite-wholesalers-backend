import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '1969240000036788035' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'BBINVISA120' })
  @IsString()
  name: string;

  @ApiProperty({ example: 1673.75 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'AUD' })
  @IsString()
  @Length(3, 3)
  currencyCode: string;

  @ApiProperty({ example: '/products/d34bc20cb2/1969240000036788035' })
  @IsString()
  productUrl: string;

  @ApiProperty({
    example: 'https://cdn1.zohoecommerce.com/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: '1969240000036788034' })
  @IsString()
  wishlistVariantId: string;
}

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit = 20;
}
