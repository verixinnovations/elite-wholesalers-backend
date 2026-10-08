import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ZohoModule } from '../zoho/zoho.module';
import { FileManagerModule } from '../../services/file-manager/file-manager.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [ZohoModule, FileManagerModule, UserModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
