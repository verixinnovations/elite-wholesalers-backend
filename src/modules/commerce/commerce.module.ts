import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { CartItem } from './entities/cart-item.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { WishlistItem } from './entities/wishlist-item.entity';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Product,
      CartItem,
      WishlistItem,
      Order,
      OrderItem,
    ]),
  ],
  controllers: [CommerceController],
  providers: [CommerceService],
})
export class CommerceModule {}
