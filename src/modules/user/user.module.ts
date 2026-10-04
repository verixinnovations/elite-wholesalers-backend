// import { CompanyModule } from './../company/company.module';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FileManagerModule } from '../../services/file-manager/file-manager.module';
import { ZohoModule } from '../zoho/zoho.module';

@Module({
  imports: [FileManagerModule, ZohoModule, TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
