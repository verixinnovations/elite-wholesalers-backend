import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Job } from '../jobs/entities/job.entity';
import { Company } from './entities/company.entity';
import { UserModule } from '../user/user.module';
import { FileManagerModule } from '../../services/file-manager/file-manager.module';
// import { JobModule } from '../jobs/job.module';

@Module({
  imports: [
    UserModule,
    FileManagerModule,
    TypeOrmModule.forFeature([User, Job, Company]),
  ],
  controllers: [CompanyController],
  providers: [CompanyService],
  exports: [CompanyService],
})
export class CompanyModule {}
