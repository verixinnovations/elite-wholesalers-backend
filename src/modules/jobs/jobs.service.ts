import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';

import { CreateApplicationDto, CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApplicationStatus,
  JobApplication,
} from './entities/job-applicants.entity';
import { User } from '../user/entities/user.entity';
import { CompanyService } from '../company/company.service';
import { Bookmark } from './entities/job-bookmark.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,

    private readonly companyService: CompanyService,
  ) {}

  // --- COMPANY/RECRUITER ACTIONS ---

  async create(user: User, createJobDto: CreateJobDto) {
    // 1. Find the company associated with this user
    const company = await this.companyService.findMyCompany(user);

    // 2. Create Job Linked to Company and User
    const newJob = this.jobRepository.create({
      ...createJobDto,
      company: company,
      creator: user,
    });

    return this.jobRepository.save(newJob);
  }

  async findMyJobs(user: User) {
    const jobs = await this.jobRepository.find({
      where: { creator: { id: user.id } },
      relations: ['applications', 'company'],
      order: { posted_on: 'DESC' },
    });
    return jobs.map((job) =>
      Object.assign(job, { applicantCount: job.applications.length }),
    );
  }

  async findMySingleJob(user: User, jobId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, creator: { id: user.id } },
      relations: ['applications', 'applications.user'], // Load detailed applicants
    });

    if (!job) throw new NotFoundException('Job not found or access denied');
    return job;
  }

  async update(user: User, jobId: string, updateJobDto: UpdateJobDto) {
    const job = await this.findMySingleJob(user, jobId);

    // Merge updates
    const updatedJob = this.jobRepository.merge(job, updateJobDto);
    return this.jobRepository.save(updatedJob);
  }

  async delete(user: User, jobId: string) {
    const job = await this.findMySingleJob(user, jobId);
    return this.jobRepository.remove(job);
  }

  // --- JOB APPLICATION MANAGEMENT (By Recruiter) ---
  async updateJobStatus(user: User, jobId: string, status: JobStatus) {
    const job = await this.findMySingleJob(user, jobId);

    job.job_status = status;

    // Logic: If Closed, auto-reject pending applicants
    if (status === JobStatus.CLOSED) {
      job.application_ends = new Date();

      // Update all pending applications to REJECTED
      await this.applicationRepository
        .createQueryBuilder()
        .update(JobApplication)
        .set({ status: ApplicationStatus.REJECTED })
        .where('job_id = :jobId', { jobId })
        .andWhere('status IN (:...statuses)', {
          statuses: [ApplicationStatus.SUBMITTED, ApplicationStatus.RECEIVED],
        })
        .execute();
    }

    return this.jobRepository.save(job);
  }

  // --- PUBLIC / APPLICANT ACTIONS ---

  async findAllOpenJobs(query?: string) {
    const whereCondition: any = { job_status: JobStatus.OPEN };
    if (query) {
      whereCondition.job_title = ILike(`%${query}%`);
    }
    return this.jobRepository.find({
      where: whereCondition,
      relations: ['company', 'creator'],
      order: { posted_on: 'DESC' },
      take: 50,
    });
  }

  async findOnePublic(jobId: string, userId?: string) {
    let isApplied = false;
    let isBookmarked = false;

    if (userId) {
      const applicant = await this.applicationRepository.findOne({
        where: { jobId: jobId, userId: userId },
      });
      if (applicant) {
        isApplied = true;
      }
      const bookmark = await this.bookmarkRepository.findOne({
        where: { jobId: jobId, userId: userId },
      });
      if (bookmark) {
        isBookmarked = true;
      }
    }

    const job = await this.jobRepository.findOne({
      where: { id: jobId },
      relations: ['company', 'creator'],
    });
    if (!job) throw new NotFoundException('Job not found');
    return Object.assign(job, { isApplied, isBookmarked });
  }
  // --- THE CORE APPLY LOGIC ---

  async applyForJob(user: User, jobId: string, dto: CreateApplicationDto) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!job) throw new NotFoundException('Job not found');

    // 1. Validations
    if (job.job_status !== JobStatus.OPEN) {
      throw new ForbiddenException('Job is not open for applications');
    }

    // 2. Check if already applied
    const existingApplication = await this.applicationRepository.findOne({
      where: {
        job: { id: jobId },
        user: { id: user.id },
      },
    });

    if (existingApplication) {
      throw new BadRequestException('You have already applied for this job');
    }

    // 3. Create Application
    const application = this.applicationRepository.create({
      job: job,
      user: user,
      cover_letter: dto.cover_letter,
      status: ApplicationStatus.SUBMITTED,
    });

    return this.applicationRepository.save(application);
  }

  // --- BOOKMARK LOGIC ---
  // (Assuming User entity has a ManyToMany relation 'bookmarked_jobs')

  async getAppliedJobs(user: User) {
    return this.applicationRepository.find({
      where: { user: { id: user.id } },
      relations: ['job', 'job.company'],
      order: { date_applied: 'DESC' },
    });
  }

  async getJobApplicants(userId: string, jobId: string) {
    return this.applicationRepository.find({
      where: { job: { id: jobId, creator: { id: userId } } },
      // relations: [ 'job', 'job.company'],
      order: { date_applied: 'DESC' },
    });
  }

  async toggleBookmark(userId: string, jobId: string) {
    const existing = await this.bookmarkRepository.findOne({
      where: { userId, jobId },
    });

    if (existing) {
      await this.bookmarkRepository.remove(existing);
      return { bookmarked: false, message: 'Bookmark removed' };
    }

    const bookmark = this.bookmarkRepository.create({ userId, jobId });
    await this.bookmarkRepository.save(bookmark);
    return { bookmarked: true, message: 'Bookmark added' };
  }

  async getMyBookmarkedJobs(userId: string) {
    const bookmarks = await this.bookmarkRepository.find({
      where: { userId },
      relations: ['job', 'job.company'],
      order: { createdAt: 'DESC' },
    });

    return bookmarks.map((bookmark) => ({
      ...bookmark.job,
      isBookmarked: true,
      bookmarkedAt: bookmark.createdAt,
    }));
  }
}
