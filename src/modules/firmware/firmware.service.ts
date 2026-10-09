import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirmwareCategory, FirmwareItem } from './entities/firmware.entity';
import {
  CreateFirmwareCategoryDto,
  CreateFirmwareItemDto,
} from './dto/create-firmware.dto';
import {
  UpdateFirmwareCategoryDto,
  UpdateFirmwareItemDto,
} from './dto/update-firmware.dto';

@Injectable()
export class FirmwareService {
  constructor(
    @InjectRepository(FirmwareCategory)
    private readonly categoryRepository: Repository<FirmwareCategory>,
    @InjectRepository(FirmwareItem)
    private readonly itemRepository: Repository<FirmwareItem>,
  ) {}

  // ==================== CATEGORIES ====================

  async createCategory(
    createDto: CreateFirmwareCategoryDto,
  ): Promise<FirmwareCategory> {
    const category = this.categoryRepository.create(createDto);
    return await this.categoryRepository.save(category);
  }

  async findAllCategories(): Promise<FirmwareCategory[]> {
    return await this.categoryRepository.find({
      relations: ['items'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOneCategory(id: string): Promise<FirmwareCategory> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async updateCategory(
    id: string,
    updateDto: UpdateFirmwareCategoryDto,
  ): Promise<FirmwareCategory> {
    const category = await this.findOneCategory(id);
    Object.assign(category, updateDto);
    return await this.categoryRepository.save(category);
  }

  async removeCategory(id: string): Promise<void> {
    const category = await this.findOneCategory(id);
    await this.categoryRepository.remove(category);
  }

  async reorderCategories(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id, index) =>
        this.categoryRepository.update(id, { order: index }),
      ),
    );
  }

  // ==================== ITEMS ====================

  async createItem(createDto: CreateFirmwareItemDto): Promise<FirmwareItem> {
    await this.findOneCategory(createDto.categoryId);
    const item = this.itemRepository.create({
      ...createDto,
      date: new Date(createDto.date),
    });
    return await this.itemRepository.save(item);
  }

  async findAllItems(): Promise<FirmwareItem[]> {
    return await this.itemRepository.find({
      relations: ['category'],
      order: { order: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOneItem(id: string): Promise<FirmwareItem> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!item) {
      throw new NotFoundException(`Firmware item with ID ${id} not found`);
    }
    return item;
  }

  async updateItem(
    id: string,
    updateDto: UpdateFirmwareItemDto,
  ): Promise<FirmwareItem> {
    const item = await this.findOneItem(id);

    if (updateDto.categoryId) {
      await this.findOneCategory(updateDto.categoryId);
    }

    const payload = {
      ...updateDto,
      ...(updateDto.date ? { date: new Date(updateDto.date) } : {}),
    };

    Object.assign(item, payload);
    return await this.itemRepository.save(item);
  }

  async removeItem(id: string): Promise<void> {
    const item = await this.findOneItem(id);
    await this.itemRepository.remove(item);
  }

  async reorderItems(ids: string[]): Promise<void> {
    await Promise.all(
      ids.map((id, index) => this.itemRepository.update(id, { order: index })),
    );
  }
}
