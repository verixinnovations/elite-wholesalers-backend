import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Job, JobStatus } from './entities/job.entity';

import { CreateJobDto, JobSearchDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import {
  ApplicationStatus,
  JobApplication,
} from './entities/job-applicants.entity';
import { User } from '../user/entities/user.entity';
import { CompanyService } from '../company/company.service';
import { Bookmark } from './entities/job-bookmark.entity';
import {
  CreateApplicationDto,
  RecruiterUpdateApplicationDto,
} from './dto/applicants.dto';
import { JobRejection } from './entities/job-rejected.entity';

@Injectable()
export class JobService {
  constructor(
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,

    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,

    @InjectRepository(JobRejection)
    private readonly rejectionRepository: Repository<JobRejection>,

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
      Object.assign(job, { applicants_count: job.applications.length }),
    );
  }

  async findMySingleJob(user: User, jobId: string) {
    const job = await this.jobRepository.findOne({
      where: { id: jobId, creator: { id: user.id } },
      relations: ['applications', 'applications.user', 'company'],
    });

    if (!job) throw new NotFoundException('Job not found or access denied');
    return Object.assign(job, { applicants_count: job.applications.length });
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

  async updateJobStatus(user: User, jobId: string, status: JobStatus) {
    const job = await this.findMySingleJob(user, jobId);

    job.job_status = status;

    if (status === JobStatus.CLOSED) {
      job.application_ends = new Date();
      await this.applicationRepository
        .createQueryBuilder()
        .update(JobApplication)
        .set({ status: ApplicationStatus.REJECTED })
        .where('jobId = :jobId', { jobId })
        .andWhere('status IN (:...statuses)', {
          statuses: [ApplicationStatus.SUBMITTED, ApplicationStatus.RECEIVED],
        })
        .execute();
    }

    return this.jobRepository.save(job);
  }

  async findAllOpenJobs(searchDto: JobSearchDto) {
    const {
      query,
      locationType,
      jobType,
      jobLocation,
      experience,
      minSalary,
      maxSalary,
      page = 1,
      limit = 10,
    } = searchDto;

    const queryBuilder = this.jobRepository
      .createQueryBuilder('job')
      .leftJoinAndSelect('job.company', 'company')
      .leftJoin('job.creator', 'creator')
      .addSelect([
        'creator.id',
        'creator.firstname',
        'creator.lastname',
        'creator.picture',
      ])
      .where('job.job_status = :status', { status: JobStatus.OPEN });

    // 1. Full-text search on Title or Description
    if (query) {
      queryBuilder.andWhere(
        '(job.job_title ILIKE :query OR job.job_description ILIKE :query)',
        { query: `%${query}%` },
      );
    }

    // 2. Enum Filters (Simple equality)
    if (locationType) {
      queryBuilder.andWhere('job.job_location_type = :locationType', {
        locationType,
      });
    }

    if (experience) {
      queryBuilder.andWhere('job.experience_level = :experience', {
        experience,
      });
    }
    if (jobType) {
      queryBuilder.andWhere('job.job_type = :jobType', {
        jobType,
      });
    }

    if (jobLocation) {
      queryBuilder.andWhere(
        new Brackets((qb) => {
          qb.where("company.address->>'city' ILIKE :loc", {
            loc: `%${jobLocation}%`,
          }).orWhere("company.address->>'state' ILIKE :loc", {
            loc: `%${jobLocation}%`,
          });
        }),
      );
    }

    if (minSalary !== undefined) {
      queryBuilder.andWhere(
        "CAST(job.salary->>'value' AS NUMERIC) >= :minSalary",
        { minSalary },
      );
    }

    if (maxSalary !== undefined) {
      queryBuilder.andWhere(
        "CAST(job.salary->>'value' AS NUMERIC) <= :maxSalary",
        { maxSalary },
      );
    }

    // 4. Pagination & Ordering
    const skippedItems = (page - 1) * limit;
    queryBuilder
      .orderBy('job.posted_on', 'DESC')
      .skip(skippedItems)
      .take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
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
      throw new BadRequestException('Job is not open for applications');
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
  async getSwippableJobs(user: User) {
    const queryBuilder = this.jobRepository.createQueryBuilder('job');

    const appliedJobIdsSubQuery = queryBuilder
      .subQuery()
      .select('app.jobId')
      .from(JobApplication, 'app') // Use the Entity class here
      .where('app.userId = :userId')
      .getQuery();

    return (
      queryBuilder
        .leftJoinAndSelect('job.company', 'company')
        // 2. Filter: Only Open jobs NOT in the subquery
        .where('job.job_status = :status', { status: JobStatus.OPEN })
        .andWhere(`job.id NOT IN (${appliedJobIdsSubQuery})`)
        // 3. Scoring Logic
        .addSelect(
          `(
      (SELECT COUNT(*) FROM jsonb_array_elements_text(job.required_skills) AS s 
       WHERE s = ANY(:userSkills)) * 10 +
      (CASE WHEN company.address->>'city' ILIKE :userCity THEN 15 ELSE 0 END) +
      (CASE WHEN job.job_description ILIKE :userBioPart THEN 5 ELSE 0 END)
    )`,
          'match_score',
        )
        .setParameters({
          userId: user.id,
          status: JobStatus.OPEN,
          userSkills: user.skills || [],
          userCity: user.location?.city || '',
          userBioPart: `%${user.bio?.substring(0, 100)}%`,
        })
        .orderBy('match_score', 'DESC')
        .addOrderBy('job.posted_on', 'DESC')
        .getMany()
    );
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

  async rejectJob(user: User, jobId: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });

    if (!job) throw new NotFoundException('Job not found');

    const existingRejection = await this.rejectionRepository.findOne({
      where: {
        job: { id: jobId },
        user: { id: user.id },
      },
    });

    if (existingRejection) {
      throw new BadRequestException('You have already rejected this job.');
    }
    const rejection = this.rejectionRepository.create({
      job: { id: job.id },
      user: { id: user.id },
    });
    return this.rejectionRepository.save(rejection);
  }

  async getrejectedJobs(user: User) {
    return this.rejectionRepository.find({
      where: { userId: user.id },
    });
  }

  async getSingleAppliedJob(user: User, jobId: string) {
    return this.applicationRepository.findOne({
      where: {
        userId: user.id,
        jobId: jobId,
      },
      relations: ['job', 'job.company'],
    });
  }

  async getJobApplicants(userId: string, jobId: string) {
    return this.applicationRepository.find({
      where: { job: { id: jobId, creator: { id: userId } } },
      relations: ['job', 'user'],
      order: { date_applied: 'DESC' },
    });
  }

  async getASingleJobApplicant(
    userId: string,
    jobId: string,
    applicantId: string,
  ) {
    return this.applicationRepository.findOne({
      where: {
        job: { id: jobId, creator: { id: userId } },
        userId: applicantId,
      },
      relations: ['job', 'user'],
      order: { date_applied: 'DESC' },
    });
  }

  async updateJobApplicant(
    recruiterId: string, // From req.user.id
    jobId: string,
    applicantId: string,
    data: RecruiterUpdateApplicationDto,
  ) {
    const application = await this.applicationRepository.findOne({
      where: {
        userId: applicantId,
        job: {
          id: jobId,
          creator: { id: recruiterId },
        },
      },
    });
    if (!application) {
      throw new NotFoundException(
        'Application not found or unauthorized access',
      );
    }
    Object.assign(application, data);
    return await this.applicationRepository.save(application);
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
