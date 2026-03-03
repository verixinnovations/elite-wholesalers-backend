import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  getInsights() {
    return {
      active_jobs: 210,
      users: 1500,
      companies_count: 230,
      daily_posts: 1200,
    };
  }
}
