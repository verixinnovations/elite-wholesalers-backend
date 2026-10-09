import { PartialType } from '@nestjs/swagger';
import {
  CreateFirmwareCategoryDto,
  CreateFirmwareItemDto,
} from './create-firmware.dto';

export class UpdateFirmwareCategoryDto extends PartialType(
  CreateFirmwareCategoryDto,
) {}

export class UpdateFirmwareItemDto extends PartialType(CreateFirmwareItemDto) {}
