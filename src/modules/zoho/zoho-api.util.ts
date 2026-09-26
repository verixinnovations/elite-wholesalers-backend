// src/utils/zoho-api-client.util.ts
import { Logger } from '@nestjs/common';
import { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

export class ZohoApiClient {
  private readonly logger: Logger;

  constructor(
    private readonly basePath: string,
    private readonly axiosInstance: AxiosInstance,
    clientName: string = 'ZohoApiClient',
  ) {
    this.logger = new Logger(clientName);
  }

  public async get<T = any>(
    endpoint: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(
        `${this.basePath}${endpoint}`,
        config,
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'GET', endpoint);
    }
  }

  public async post<T = any>(
    endpoint: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(
        `${this.basePath}${endpoint}`,
        data,
        config,
      );
      return response.data;
    } catch (error) {
      this.handleError(error, 'POST', endpoint);
    }
  }

  private handleError(error: any, method: string, endpoint: string): never {
    if (error instanceof AxiosError) {
      const statusCode = error.response?.status || 500;
      const errorMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;

      this.logger.error(
        `[${method} ${this.basePath}${endpoint}] - Status: ${statusCode} - ${errorMsg}`,
      );
      throw new Error(`Zoho API Error (${statusCode}): ${errorMsg}`);
    } else {
      this.logger.error(`Unknown Error: ${error.message}`);
      throw error;
    }
  }
}
