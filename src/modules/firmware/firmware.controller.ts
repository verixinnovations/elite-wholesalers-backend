import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FirmwareService } from './firmware.service';
import {
  CreateFirmwareCategoryDto,
  CreateFirmwareItemDto,
  ReorderDto,
} from './dto/create-firmware.dto';

import { FirmwareCategory, FirmwareItem } from './entities/firmware.entity';
import {
  UpdateFirmwareCategoryDto,
  UpdateFirmwareItemDto,
} from './dto/update-firmware.dto';

@ApiTags('Firmware')
@Controller('firmware')
export class FirmwareController {
  constructor(private readonly firmwareService: FirmwareService) {}

  // ==================== CATEGORIES ====================

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new firmware category' })
  @ApiResponse({
    status: 201,
    description: 'Category created successfully',
    type: FirmwareCategory,
  })
  createCategory(
    @Body() createDto: CreateFirmwareCategoryDto,
  ): Promise<FirmwareCategory> {
    return this.firmwareService.createCategory(createDto);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories with nested items' })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
    type: [FirmwareCategory],
  })
  findAllCategories(): Promise<FirmwareCategory[]> {
    return this.firmwareService.findAllCategories();
  }

  @Patch('categories/reorder')
  @ApiOperation({ summary: 'Reorder categories sequence' })
  @ApiResponse({
    status: 200,
    description: 'Categories reordered successfully',
  })
  reorderCategories(@Body() reorderDto: ReorderDto): Promise<void> {
    return this.firmwareService.reorderCategories(reorderDto.ids);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get a single category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category found',
    type: FirmwareCategory,
  })
  findOneCategory(@Param('id') id: string): Promise<FirmwareCategory> {
    return this.firmwareService.findOneCategory(id);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update category by ID' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({
    status: 200,
    description: 'Category updated',
    type: FirmwareCategory,
  })
  updateCategory(
    @Param('id') id: string,
    @Body() updateDto: UpdateFirmwareCategoryDto,
  ): Promise<FirmwareCategory> {
    return this.firmwareService.updateCategory(id, updateDto);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete category by ID (cascades to items)' })
  @ApiParam({ name: 'id', description: 'Category UUID' })
  @ApiResponse({ status: 204, description: 'Category deleted' })
  removeCategory(@Param('id') id: string): Promise<void> {
    return this.firmwareService.removeCategory(id);
  }

  // ==================== ITEMS ====================

  @Post('items')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new firmware resource item' })
  @ApiResponse({
    status: 201,
    description: 'Item created successfully',
    type: FirmwareItem,
  })
  createItem(@Body() createDto: CreateFirmwareItemDto): Promise<FirmwareItem> {
    return this.firmwareService.createItem(createDto);
  }

  @Get('items')
  @ApiOperation({ summary: 'Get all firmware items' })
  @ApiResponse({
    status: 200,
    description: 'List of items',
    type: [FirmwareItem],
  })
  findAllItems(): Promise<FirmwareItem[]> {
    return this.firmwareService.findAllItems();
  }

  @Patch('items/reorder')
  @ApiOperation({ summary: 'Reorder items sequence' })
  @ApiResponse({ status: 200, description: 'Items reordered successfully' })
  reorderItems(@Body() reorderDto: ReorderDto): Promise<void> {
    return this.firmwareService.reorderItems(reorderDto.ids);
  }

  @Get('items/:id')
  @ApiOperation({ summary: 'Get a single firmware item by ID' })
  @ApiParam({ name: 'id', description: 'Item UUID' })
  @ApiResponse({ status: 200, description: 'Item found', type: FirmwareItem })
  findOneItem(@Param('id') id: string): Promise<FirmwareItem> {
    return this.firmwareService.findOneItem(id);
  }

  @Patch('items/:id')
  @ApiOperation({ summary: 'Update firmware item by ID' })
  @ApiParam({ name: 'id', description: 'Item UUID' })
  @ApiResponse({ status: 200, description: 'Item updated', type: FirmwareItem })
  updateItem(
    @Param('id') id: string,
    @Body() updateDto: UpdateFirmwareItemDto,
  ): Promise<FirmwareItem> {
    return this.firmwareService.updateItem(id, updateDto);
  }

  @Delete('items/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete firmware item by ID' })
  @ApiParam({ name: 'id', description: 'Item UUID' })
  @ApiResponse({ status: 204, description: 'Item deleted' })
  removeItem(@Param('id') id: string): Promise<void> {
    return this.firmwareService.removeItem(id);
  }
}
