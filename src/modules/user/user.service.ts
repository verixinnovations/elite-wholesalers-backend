import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { FileManagerService } from '../../services/file-manager/file-manager.service';
import { UserRoles } from './dto/create-user.dto';
import { Company } from '../company/entities/company.entity';
import { Bookmark } from '../jobs/entities/job-bookmark.entity';
import {
  ApplicationStatus,
  JobApplication,
} from '../jobs/entities/job-applicants.entity';
import { Job, JobStatus } from '../jobs/entities/job.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly fileManagerService: FileManagerService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,

    @InjectRepository(Job) private readonly jobRepository: Repository<Job>,

    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,

    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
  ) {}

  findAllUser(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(param: object): Promise<User & { company?: Company | null }> {
    const user = await this.userRepository.findOneBy(param);
    if (!user) throw new NotFoundException('User not found');

    if (user.role === UserRoles.RECRUITER) {
      const company = await this.companyRepository.findOneBy({
        ownerId: user.id,
      });
      return Object.assign(user, { company });
    }
    return user;
  }

  async viewUser(userId: string) {
    return this.findOne({ id: userId });
  }

  async getUserProfileSummary(userId: string) {
    await this.findOne({ id: userId });
    const [
      totalAppliedJobs,
      totalBookmarkedJobs,
      totalPostedJobs,
      totalActivePostedJobs,
      totalApplicants,
      totalHired,
      totalOffers,
    ] = await Promise.all([
      this.applicationRepository.count({ where: { userId } }),
      this.bookmarkRepository.count({ where: { userId } }),
      this.jobRepository.count({ where: { creator: { id: userId } } }),
      this.jobRepository.count({
        where: { creator: { id: userId }, job_status: JobStatus.OPEN },
      }),
      this.applicationRepository.count({
        where: { job: { creator: { id: userId } } },
      }),
      this.applicationRepository.count({
        where: {
          job: { creator: { id: userId } },
          status: ApplicationStatus.ACCEPTED,
        },
      }),
      this.applicationRepository.count({
        where: { userId, status: ApplicationStatus.ACCEPTED },
      }),
    ]);

    return {
      totalAppliedJobs,
      totalBookmarkedJobs,
      totalPostedJobs,
      totalActivePostedJobs,
      totalApplicants,
      totalHired,
      totalOffers,
      successRate:
        totalAppliedJobs > 0
          ? Math.round((totalOffers / totalAppliedJobs) * 100)
          : 0,
    };
  }
  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { email, password, username, role, ...data } = updateUserDto;
    const user = await this.userRepository.preload({
      id,
      ...data,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async updateUserRole(id: string, role: UserRoles): Promise<User> {
    const user = await this.userRepository.preload({
      id,
      role,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.userRepository.save(user);
  }

  async uploadPicture(userId: string, file: Express.Multer.File) {
    const user = await this.viewUser(userId);
    const picture = await this.fileManagerService.uploadImage(file);
    user.picture = picture.url;
    return this.userRepository.save(user);
  }
  async uploadResume(userId: string, file: Express.Multer.File) {
    const user = await this.viewUser(userId);
    const resume = await this.fileManagerService.uploadResume(file);
    user.resume = {
      name: resume.name,
      url: resume.url,
      format: resume.format,
    };
    return this.userRepository.save(user);
  }

  /**
   * this function is used to remove or delete user from database.
   * @param id is the type of number, which represent id of user
   * @returns nuber of rows deleted or affected
   */
  async removeUser(id: string): Promise<DeleteResult> {
    const result: DeleteResult = await this.userRepository.softDelete(id);

    // In practice, affected is 0 when no rows are deleted; it is almost never null
    // However, the type allows null, so we handle affected === 0 || affected === null
    if (!result.affected) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result;
  }
}
