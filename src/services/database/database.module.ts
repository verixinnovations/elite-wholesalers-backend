import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. Import Config tools
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../modules/user/entities/user.entity';
import { Verification } from '../../modules/auth/entities/auth.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { CartItem } from '../../modules/commerce/entities/cart-item.entity';
import { OrderItem } from '../../modules/commerce/entities/order-item.entity';
import { Order } from '../../modules/commerce/entities/order.entity';
import { WishlistItem } from '../../modules/commerce/entities/wishlist-item.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        entities: [
          User,
          Verification,
          Product,
          CartItem,
          WishlistItem,
          Order,
          OrderItem,
        ],
        synchronize: true,
        dropSchema: false,
        logging: false,
        ssl: {
          rejectUnauthorized: false,
        },
        uselibpqcompat: true,
        sslmode: 'require',
        extra: {
          sslmode: 'require',
          uselibpqcompat: true,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
