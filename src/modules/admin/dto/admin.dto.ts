import { ApiProperty } from '@nestjs/swagger';

export class ProductSpecsDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  product_file: Express.Multer.File;
}
