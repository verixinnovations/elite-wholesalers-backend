import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmwareCategory, FirmwareItem } from './entities/firmware.entity';
import { FirmwareService } from './firmware.service';
import { FirmwareController } from './firmware.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FirmwareCategory, FirmwareItem])],
  controllers: [FirmwareController],
  providers: [FirmwareService],
  exports: [FirmwareService],
})
export class FirmwareModule {}
