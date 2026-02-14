import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  getInsights() {
    return {
      jobPosted: 210,
      users: 1500,
      companies: 230,
      applications: 1200,
    };
  }
}
