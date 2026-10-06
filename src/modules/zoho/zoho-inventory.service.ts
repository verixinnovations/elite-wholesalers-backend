import { BadRequestException, Injectable } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoApiClient } from './zoho-api.util';
import { categoriesData } from './custom-data';
import type {
  CategoryEntity,
  InvoicePayload,
  ProductEntity,
} from './zoho-interface';
import { ProductQueryDto } from '../products/dto/create-product.dto';
import { CreateContactDto } from './dto/create-zoho-user.dto';

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

  async createCustomer(data: CreateContactDto): Promise<any> {
    const { contact } = await this.inventoryApi.post('/contacts', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return contact;
  }

  async getCustomer(contactId: string): Promise<any> {
    const { contact } = await this.inventoryApi.get(`/contacts/${contactId}`);
    return contact;
  }

  async createSalesOrder(data: InvoicePayload) {
    const { salesorder } = await this.inventoryApi.post('/salesorders', data);
    return salesorder;
  }

  async findUserOrders(customer_id: string) {
    const { salesorders } = await this.inventoryApi.get(`/salesorders/`, {
      params: { customer_id },
    });
    return salesorders;
  }

  async findSalesOrder(salesorderId: string) {
    const { salesorder } = await this.inventoryApi.get(
      `/salesorders/${salesorderId}`,
    );
    return salesorder;
  }

  async createInvoice(data: InvoicePayload) {
    const { invoice } = await this.inventoryApi.post('/invoices', data, {
      headers: { 'Content-Type': 'application/json' },
      params: { send: true },
    });
    return invoice;
  }

  async getInvoice(invoiceId: string) {
    const { invoice } = await this.inventoryApi.get(`/invoices/${invoiceId}`);
    return invoice;
  }

  async updateInvoice(invoiceId: string, data: object) {
    const { invoice } = await this.inventoryApi.put(
      `/invoices/${invoiceId}`,
      data,
    );
    return invoice;
  }

  async markInvoiceAsSent(invoiceId: string) {
    const { invoice } = await this.inventoryApi.post(
      `/invoices/${invoiceId}/status/sent`,
    );
    return invoice;
  }

  async getInventoryItems(
    searchQuery?: ProductQueryDto,
  ): Promise<ProductEntity[]> {
    const data = await this.inventoryApi.get<{ items: ProductEntity[] }>(
      '/items',
      {
        params: {
          per_page: 100,
          filter_by: 'Status.Active',
          ...searchQuery,
        },
      },
    );
    return data.items.filter((item) => item.show_in_storefront === true);
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
      .filter((item) => item.show_in_storefront === true)
      .slice(0, 8);
  }

  async getInventoryItem(productId: string): Promise<ProductEntity> {
    const data = await this.inventoryApi.get<{ item: ProductEntity }>(
      `/items/${productId}`,
    );
    return data.item;
  }

  async getInventoryCategories(): Promise<CategoryEntity[]> {
    const { categories } = await this.commerceApi.get<{
      categories: CategoryEntity[];
    }>('/categories');
    console.log({ categories: categories.length });
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
    }>('/categories', { params: { filter_by: 'ShowInMenu' } });

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
      subCategories: subCategories.map((subCat) => {
        const has_sub_categories = categories.some(
          (cat) => cat.parent_category_id === subCat.category_id,
        );
        return {
          ...subCat,
          has_sub_categories,
        };
      }),
    };
  }

  async getInventoryCategory(categoryId: string) {
    const { category } = await this.inventoryApi.get<{
      category: CategoryEntity;
    }>(`/categories/${categoryId}`);

    if (category && Array.isArray(category.children)) {
      category.children = category.children.filter((child) => child.visibility);
    }
    return category;
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
