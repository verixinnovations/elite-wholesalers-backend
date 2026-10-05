import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ZohoModule } from '../zoho/zoho.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { CommerceModule } from '../commerce/commerce.module';

@Module({
  imports: [
    ZohoModule,
    UserModule,
    CommerceModule,
    TypeOrmModule.forFeature([Cart]),
  ],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
