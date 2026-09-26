import { Module } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoController } from './zoho.controller';
import { ZohoInventoryService } from './zoho-inventory.service';

@Module({
  controllers: [ZohoController],
  providers: [ZohoService, ZohoInventoryService],
  exports: [ZohoService, ZohoInventoryService],
})
export class ZohoModule {}
