import { Module } from '@nestjs/common';
import { JobService } from './jobs.service';
import { JobController } from './job.controller';
import { Job } from './entities/job.entity';
import { Company } from '../company/entities/company.entity';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobApplication } from './entities/job-applicants.entity';
import { UserModule } from '../user/user.module';
import { CompanyModule } from '../company/company.module';
import { Bookmark } from './entities/job-bookmark.entity';

@Module({
  imports: [
    CompanyModule,
    UserModule,
    TypeOrmModule.forFeature([User, Job, JobApplication, Company, Bookmark]),
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
