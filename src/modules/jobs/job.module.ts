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
import { JobRejection } from './entities/job-rejected.entity';
import { EmailModule } from 'src/services/emails/email.module';

@Module({
  imports: [
    CompanyModule,
    UserModule,
    EmailModule,
    TypeOrmModule.forFeature([
      User,
      Job,
      JobApplication,
      JobRejection,
      Company,
      Bookmark,
    ]),
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
