import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { AustralianState } from './dto/verify.dto';
interface LicenceTokenCache {
  accessToken: null | string;
  apikey: null | string;
  expiresAt: number;
}

@Injectable()
export class UtilsService {
  constructor(private configService: ConfigService) {}

  private tokenCache: LicenceTokenCache = {
    accessToken: null,
    apikey: null,
    expiresAt: 0,
  };

  async fetchABNDetails(abn: string) {
    const abnVerifyURL = this.configService.get<string>('ABN_VERIFY_URL');
    const abnVerifyGUID = this.configService.get<string>('ABN_VERFIY_GUID');

    if (!abnVerifyURL || !abnVerifyGUID) {
      throw new InternalServerErrorException(
        'ABN verification configuration is missing.',
      );
    }

    try {
      const { data } = await axios.get(abnVerifyURL, {
        params: { abn, callback: 'ABNDetails', guid: abnVerifyGUID },
        transformResponse: [
          (raw: string) => {
            if (!raw) return null;
            const start = raw.indexOf('(') + 1;
            const end = raw.lastIndexOf(')');

            if (start === 0 || end === -1) {
              return JSON.parse(raw);
            }
            const jsonString = raw.slice(start, end);
            return JSON.parse(jsonString);
          },
        ],
      });

      if (data && data.Message) {
        throw new BadRequestException(`ABN Lookup Failed: ${data.Message}`);
      }

      return data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to communicate with ABN Registry or invalid ABN provided.',
      );
    }
  }

  private async getAccessToken() {
    if (this.tokenCache.accessToken && Date.now() < this.tokenCache.expiresAt) {
      return this.tokenCache;
    }
    const licenceTokenURL = this.configService.get<string>('LICENCE_TOKEN_URL');
    const licenceAuthToken =
      this.configService.get<string>('LICENCE_AUTH_TOKEN');
    if (licenceTokenURL) {
      const { data } = await axios.get(licenceTokenURL, {
        headers: { Authorization: `Basic ${licenceAuthToken}` },
      });

      this.tokenCache = {
        accessToken: data.access_token,
        apikey: data.client_id,
        expiresAt: Date.now() + (Number(data.expires_in || 3600) - 60) * 1000,
      };
      return this.tokenCache;
    } else {
      throw new BadGatewayException('Unable to reach Licence Server');
    }
  }

  async fetchLicenseData(
    licenceNumber: string,
    stateIssued: AustralianState | string,
  ) {
    const state = stateIssued.toLowerCase();

    switch (state) {
      case 'nsw':
        return await this.verifyNswLicense(licenceNumber);

      default:
        throw new BadRequestException(
          `License verification for ${stateIssued.toUpperCase()} is not supported.`,
        );
    }
  }

  // Extracted the NSW logic into a private method to keep your code clean
  private async verifyNswLicense(licenceNumber: string) {
    const { accessToken, apikey } = await this.getAccessToken();
    const licenceVerifyUrl =
      this.configService.get<string>('LICENSE_VERIFY_URL');

    if (!licenceVerifyUrl) {
      throw new Error('LICENSE_VERIFY_URL environment variable is missing.');
    }

    try {
      const verifyResponse = await axios.get(licenceVerifyUrl, {
        params: { licenceNumber },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: apikey,
          Accept: 'application/json',
        },
      });

      if (verifyResponse.data && verifyResponse.data.length > 0) {
        if (verifyResponse.data[0].status === 'Current') {
          return verifyResponse.data[0];
        } else
          throw new BadRequestException(
            'This license has expired or inactive.',
          );
      } else throw new BadRequestException('License is invalid');
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
