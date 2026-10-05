import { PartialType } from '@nestjs/swagger';
import { CreateCartDto } from './create-cart.dto';
import { IsNumber, Min } from 'class-validator';

export class UpdateCartDto extends PartialType(CreateCartDto) {
  @IsNumber()
  @Min(1)
  quantity: number;
}
