import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { UserModule } from '../user/user.module';
import { EmailModule } from '../../services/emails/email.module';

@Module({
  imports: [UserModule, EmailModule],
  controllers: [UtilsController],
  providers: [UtilsService],
})
export class UtilsModule {}
