import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { CommerceController } from './commerce.controller';
import { CommerceService } from './commerce.service';
import { ZohoModule } from '../zoho/zoho.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ZohoModule, UserModule, TypeOrmModule.forFeature([Product])],
  controllers: [CommerceController],
  providers: [CommerceService],
  exports: [CommerceService],
})
export class CommerceModule {}
