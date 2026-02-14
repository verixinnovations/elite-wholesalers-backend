import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { JobApplication } from './job-applicants.entity';
import { Company } from '../../company/entities/company.entity';
import { User } from '../../user/entities/user.entity';
import { Bookmark } from './job-bookmark.entity';

// --- Enums & Interfaces ---
export enum JobType {
  FULL_TIME = 'Full-Time',
  PART_TIME = 'Part-Time',
  CONTRACT = 'Contract',
  INTERNSHIP = 'Internship',
  VOLUNTARY = 'Voluntary',
}

export enum JobLocationType {
  REMOTE = 'remote',
  ONSITE = 'onsite',
  HYBRID = 'hybrid',
}

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  PAUSED = 'paused',
}

export enum ExperienceLevel {
  INTERNSHIP = 'intership',
  ENTRY = 'entry',
  JUNIOR = 'junior',
  MID = 'mid',
  SENIOR = 'senior',
  EXPERT = 'expert',
}

export interface JobDuration {
  date: 'week' | 'month' | 'year';
  value: number;
}

export interface JobSalary {
  currency: string;
  value: number;
}

export interface RequiredSkill {
  name: string;
  icon: string;
}

@Entity('jobs')
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- RELATIONSHIPS ---

  // 1. The Company (Organization)
  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ name: 'companyId', update: false })
  companyId: string;

  // 2. The Recruiter (User who posted it)
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'creatorId' })
  creator: User;

  @Column({ name: 'creatorId', update: false })
  creatorId: number;

  // 3. The List of Applicants
  // Access this via job.applications
  @OneToMany(() => JobApplication, (application) => application.job)
  applications: JobApplication[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  // --- JOB DATA ---

  @Column()
  job_title: string;

  @Column({ type: 'text' })
  job_description: string;

  @Column({
    type: 'enum',
    enum: JobType,
    default: JobType.PART_TIME,
  })
  job_type: JobType;

  @Column({ type: 'timestamp' })
  application_ends: Date;

  @Column({ type: 'jsonb' })
  job_duration: JobDuration;

  @Column({ type: 'jsonb' })
  salary: JobSalary;

  @Column({ type: 'jsonb' })
  required_skills: string[];

  @Column({
    type: 'enum',
    enum: JobLocationType,
    default: JobLocationType.REMOTE,
  })
  job_location_type: JobLocationType;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  job_status: JobStatus;

  @Column({
    type: 'enum',
    enum: ExperienceLevel,
    default: ExperienceLevel.MID,
  })
  experience_level: ExperienceLevel;

  @Column({ type: 'jsonb' })
  requirements: string[];

  @Column({ type: 'jsonb' })
  benefits: string[];

  @CreateDateColumn()
  posted_on: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
