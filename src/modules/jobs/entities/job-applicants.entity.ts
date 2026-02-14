import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from '../../user/entities/user.entity';

export enum ApplicationStatus {
  SUBMITTED = 'submitted',
  RECEIVED = 'received',
  PROCESSING = 'processing',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

// Interface for the JSONB column
export interface InterviewFeedback {
  date: Date;
  comments: string;
  score?: number;
}

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // --- RELATIONSHIPS ---

  // Link to the Job
  @ManyToOne(() => Job, (job) => job.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ name: 'jobId', update: false })
  jobId: string;

  // Link to the User (The Applicant)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId', update: false })
  userId: string;

  // --- APPLICANT DATA ---

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
  })
  status: ApplicationStatus;

  @Column({ type: 'text', nullable: true })
  cover_letter: string;

  // Stores an array of feedback objects [{date:..., comments:...}]
  @Column({ type: 'jsonb', nullable: true, default: [] })
  interview_feedback: InterviewFeedback[];

  @Column({ type: 'float', default: 0 })
  evaluation_score: number;

  @Column({ type: 'text', default: '' })
  notes: string;

  // Stores dates for scheduled interviews
  @Column({ type: 'timestamp', array: true, default: [] })
  interview_dates: Date[];

  @CreateDateColumn()
  date_applied: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
