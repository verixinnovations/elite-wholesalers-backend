// src/modules/zoho/zoho.service.ts
import { Injectable } from '@nestjs/common';
import { ZohoService } from './zoho.service';
import { ZohoApiClient } from './zoho-api.util';
import { categoriesData } from './custom-data';

@Injectable()
export class ZohoInventoryService {
  private readonly inventoryApi: ZohoApiClient;
  private readonly crmApi: ZohoApiClient;
  private readonly commerceApi: ZohoApiClient;

  constructor(private readonly zohoService: ZohoService) {
    // Instantiate clients with their specific base paths
    this.inventoryApi = this.zohoService.createClient(
      '/inventory/v1',
      'InventoryAPI',
    );

    this.commerceApi = this.zohoService.createClient(
      '/store/api/v1',
      'CommerceAPI',
    );
    // You can now easily talk to CRM via REST as well
    this.crmApi = this.zohoService.createClient('/crm/v8', 'CrmAPI');
  }

  // ==========================================
  // INVENTORY ENDPOINTS
  // ==========================================

  async getInventoryItems(page = 1, perPage = 20) {
    const data = await this.commerceApi.get('/products', {
      params: {
        page_start_from: page,
        per_page: perPage,
      },
    });
    return data;
  }

  async getInventoryCategories() {
    const data = await this.commerceApi.get('/categories');
    const activeCategories = data.categories.filter(
      (cat) => cat.parent_category_id === '-1' && cat.has_active_items === true,
    );

    return activeCategories.map((cat) => {
      const match = categoriesData.find((item) => item.slug === cat.url);

      return {
        ...cat,
        image: match?.image || null,
        description: match?.summary || cat.description || '',
      };
    });
  }

  async getInventoryItemImageStream(itemId: string) {
    // The Axios responseType config flows natively through your wrapper
    return await this.inventoryApi.get(`/items/${itemId}/image`, {
      responseType: 'stream',
    });
  }

  // ==========================================
  // CRM ENDPOINTS (SDK REPLACEMENT)
  // ==========================================

  async getCrmProducts(page = 1, perPage = 20) {
    // To get all fields in the REST API, just don't pass the 'fields' param!
    const data = await this.crmApi.get('/Products', {
      params: { page, per_page: perPage },
    });
    return data.data;
  }
}
