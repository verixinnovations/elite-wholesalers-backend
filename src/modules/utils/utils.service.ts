import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  getInsights() {
    return {
      active_jobs: 4000,
      users: 1500,
      companies_count: 250,
      daily_posts: 120,
    };
  }
}
