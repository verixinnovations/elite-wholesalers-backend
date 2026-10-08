import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
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

export type ProductSortColumn =
  | 'name'
  | 'sku'
  | 'rate'
  | 'purchase_rate'
  | 'created_time'
  | 'last_modified_time'
  | 'reorder_level'
  | 'stock_on_hand';

// 2. Define sort order as a type
export type ProductSortOrder = 'A' | 'D';

export class ProductQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name_contains?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  category_id?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @ApiProperty({ required: false, default: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  per_page: number = 200;

  @ApiProperty({
    required: false,
    default: 'name',
    enum: [
      'name',
      'sku',
      'rate',
      'purchase_rate',
      'created_time',
      'last_modified_time',
      'reorder_level',
      'stock_on_hand',
    ],
  })
  @IsOptional()
  @IsString()
  @IsEnum([
    'name',
    'sku',
    'rate',
    'purchase_rate',
    'created_time',
    'last_modified_time',
    'reorder_level',
    'stock_on_hand',
  ])
  sort_column?: ProductSortColumn = 'name';

  @ApiProperty({ required: false, default: 'D', enum: ['A', 'D'] })
  @IsOptional()
  @IsString()
  @IsEnum(['A', 'D'])
  sort_order?: ProductSortOrder = 'D';
}
