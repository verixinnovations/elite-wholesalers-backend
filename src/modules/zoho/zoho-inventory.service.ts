// src/modules/zoho/zoho.service.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoApiClient } from './zoho-api.util';
import { categoriesData } from './custom-data';
import type { CategoryEntity, ProductEntity } from './zoho-interface';

@Injectable()
export class ZohoInventoryService {
  private readonly inventoryApi: ZohoApiClient;
  private readonly commerceApi: ZohoApiClient;

  constructor(private readonly zohoService: ZohoService) {
    this.inventoryApi = this.zohoService.createClient(
      '/inventory/v1',
      'InventoryAPI',
    );

    this.commerceApi = this.zohoService.createClient(
      '/store/api/v1',
      'CommerceAPI',
    );
  }

  async getInventoryItems(): Promise<ProductEntity[]> {
    const data = await this.commerceApi.get<{ products: ProductEntity[] }>(
      '/products',
      {
        params: {
          per_page: 100,
          filter_by: 'Status.Active',
        },
      },
    );
    return data.products;
  }

  async getFeaturedInventoryItems(): Promise<ProductEntity[]> {
    const data = await this.inventoryApi.get<{ items: ProductEntity[] }>(
      '/items',
      {
        params: {
          per_page: 1000,
          filter_by: 'Status.Active',
        },
      },
    );

    return data.items
      .filter(
        (item) => item.show_in_storefront === true && item.available_stock > 1,
      )
      .slice(0, 8);
  }

  async getInventoryItem(productId: string): Promise<ProductEntity> {
    const data = await this.commerceApi.get<{ item: ProductEntity }>(
      `/items/${productId}`,
    );
    return data.item;
  }

  async getInventoryCategories(): Promise<CategoryEntity[]> {
    const { categories } = await this.commerceApi.get<{
      categories: CategoryEntity[];
    }>('/categories');
    const activeCategories = categories.filter(
      (category) =>
        category.parent_category_id === '-1' &&
        category.visibility &&
        category.has_active_items,
    );

    return activeCategories.map((category) => {
      const match = categoriesData.find((item) => item.slug === category.url);

      return {
        ...category,
        image: match?.image || null,
        description: match?.summary || category.description || '',
      };
    });
  }

  async getInventorySubCategories(categoryId: string, hostUrl: string) {
    const { categories } = await this.inventoryApi.get<{
      categories: CategoryEntity[];
    }>('/categories', {
      params: {
        parent_category_id: categoryId,
      },
    });

    const subCategories = categories.filter(
      (category) =>
        category.parent_category_id === categoryId && category.visibility,
    );
    const parentCategory = categories.find(
      (category) => category.category_id === categoryId,
    );

    if (!parentCategory) {
      throw new BadRequestException(
        `Category with ID ${categoryId} not found.`,
      );
    }

    const extraData = categoriesData.find(
      (item) => item.slug === parentCategory.url,
    );

    return {
      parentCategory: {
        ...parentCategory,
        image: extraData?.image ? hostUrl + extraData.image : null,
        description: extraData?.summary ?? parentCategory.description ?? '',
      },
      subCategories,
    };
  }

  async getInventoryItemImageStream(itemId: string) {
    return await this.inventoryApi.get(`/items/${itemId}/image`, {
      responseType: 'stream',
    });
  }

  async getProductsByCategoryId(categoryId?: string) {
    const { items: products } = await this.inventoryApi.get(`/items/`, {
      params: {
        category_id: categoryId,
        filter_by: 'Status.Active',
      },
    });
    return products.filter(
      (product: ProductEntity) => product.show_in_storefront === true,
    );
  }
}
