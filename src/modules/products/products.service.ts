import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductQueryDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';
import { ProductEntity } from '../zoho/zoho-interface';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private zohoInventoryService: ZohoInventoryService,
  ) {}

  async findAll(params?: ProductQueryDto) {
    const products = await this.zohoInventoryService.getInventoryItems(params);
    return products;
  }
  async getFeaturedProducts() {
    const products =
      await this.zohoInventoryService.getFeaturedInventoryItems();
    return products;
  }

  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.zohoInventoryService.getInventoryItem(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async remove(id: string): Promise<void> {
    const result = await this.productRepository.delete(id);
    if (!result.affected) throw new NotFoundException('Product not found');
  }

  getProductCategories() {
    return this.zohoInventoryService.getInventoryCategories();
  }

  getProductSubCategories(categoryId: string, hostUrl: string) {
    return this.zohoInventoryService.getInventorySubCategories(
      categoryId,
      hostUrl,
    );
  }

  getProductCategory(categoryId: string) {
    return this.zohoInventoryService.getInventoryCategory(categoryId);
  }

  getProductByCategoryId(categoryId: string, params?: ProductQueryDto) {
    return this.zohoInventoryService.getProductsByCategoryId(
      categoryId,
      params,
    );
  }
}
