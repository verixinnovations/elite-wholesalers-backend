// import { CompanyModule } from './../company/company.module';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FileManagerModule } from '../../services/file-manager/file-manager.module';
import { Company } from '../company/entities/company.entity';
import { Job } from '../jobs/entities/job.entity';
import { JobApplication } from '../jobs/entities/job-applicants.entity';
import { Bookmark } from '../jobs/entities/job-bookmark.entity';

@Module({
  imports: [
    FileManagerModule,
    TypeOrmModule.forFeature([User, Company, Bookmark, JobApplication, Job]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
