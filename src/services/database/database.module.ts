import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. Import Config tools
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../modules/user/entities/user.entity';
import { Verification } from '../../modules/auth/entities/auth.entity';
import { Product } from '../../modules/products/entities/product.entity';
import { Cart } from '../../modules/cart/entities/cart.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        entities: [User, Verification, Product, Cart],
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
