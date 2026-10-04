import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ZohoModule } from '../zoho/zoho.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ZohoModule, UserModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
