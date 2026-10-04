import { Module } from '@nestjs/common';
import { UtilsService } from './utils.service';
import { UtilsController } from './utils.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [UtilsController],
  providers: [UtilsService],
})
export class UtilsModule {}
