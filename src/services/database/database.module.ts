import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 1. Import Config tools
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../../modules/user/entities/user.entity';
import { Verification } from '../../modules/auth/entities/auth.entity';
import { Company } from '../../modules/company/entities/company.entity';
import { Job } from '../../modules/jobs/entities/job.entity';
import { JobApplication } from '../../modules/jobs/entities/job-applicants.entity';
import { Bookmark } from '../../modules/jobs/entities/job-bookmark.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        entities: [User, Verification, Company, Job, Bookmark, JobApplication],
        synchronize: configService.get<boolean>('DB_SYNC', true),
        dropSchema: false,
        logging: false,
        ssl: {
          rejectUnauthorized: false,
        },
      }),
    }),
  ],
})
export class DatabaseModule {}
