import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { ZohoApiClient } from './zoho-api.util';

@Injectable()
export class ZohoService {
  // <-- Removed OnModuleInit
  private readonly logger = new Logger(ZohoService.name);

  public zohoClient: AxiosInstance;

  private cachedAccessToken: string | null = null;
  private tokenExpirationTime: number = 0;

  constructor(private readonly configService: ConfigService) {
    // 1. Initialize immediately in the constructor!
    this.zohoClient = axios.create({
      baseURL:
        this.configService.get<string>('ZOHO_API_BASE_URL') ||
        'https://www.zohoapis.com',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 2. Attach the Request Interceptor
    this.zohoClient.interceptors.request.use(async (config) => {
      const accessToken = await this.getActiveAccessToken();

      config.headers = config.headers || {};
      config.headers.Authorization = `Zoho-oauthtoken ${accessToken}`;

      if (
        config.url?.includes('/inventory/') ||
        config.url?.includes('/storefront/')
      ) {
        config.params = config.params || {};
        config.params.organization_id = this.configService.get<string>(
          'ZOHO_INVENTORY_ORG_ID',
        );

        if (!config.params.organization_id) {
          throw new Error(
            'Missing ZOHO_INVENTORY_ORG_ID in environment variables.',
          );
        }
      }

      if (
        config.url?.includes('/storefront/') ||
        config.url?.includes('/store/')
      ) {
        config.baseURL = 'https://commerce.zoho.com';

        const domainName = this.configService.get<string>(
          'ZOHO_COMMERCE_DOMAIN',
        );
        if (!domainName) {
          throw new Error(
            'Missing ZOHO_COMMERCE_DOMAIN in environment variables.',
          );
        }
        config.headers['domain-name'] = domainName;
      }
      return config;
    });
  }

  createClient(basePath: string, clientName?: string): ZohoApiClient {
    return new ZohoApiClient(basePath, this.zohoClient, clientName);
  }

  private async getActiveAccessToken(): Promise<string | null> {
    if (this.cachedAccessToken && Date.now() < this.tokenExpirationTime) {
      return this.cachedAccessToken;
    }

    try {
      const response = await axios.post(
        'https://accounts.zoho.com/oauth/v2/token',
        null,
        {
          params: {
            refresh_token: this.configService.get<string>('ZOHO_REFRESH_TOKEN'),
            client_id: this.configService.get<string>('ZOHO_CLIENT_ID'),
            client_secret: this.configService.get<string>('ZOHO_CLIENT_SECRET'),
            grant_type: 'refresh_token',
          },
        },
      );

      this.cachedAccessToken = response.data.access_token;
      this.tokenExpirationTime = Date.now() + 55 * 60 * 1000;

      this.logger.log('Successfully refreshed Zoho OAuth token.');
      return this.cachedAccessToken;
    } catch (error: any) {
      this.logger.error(
        'Failed to generate Zoho access token',
        error?.response?.data || error.message,
      );
      throw new Error('Authentication with Zoho failed');
    }
  }
}
