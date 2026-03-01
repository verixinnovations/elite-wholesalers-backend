import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Job } from './job.entity';
import { User } from 'src/modules/user/entities/user.entity';

@Entity('job_rejections')
export class JobRejection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Link to the User (The Applicant)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId', update: false })
  userId: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'jobId' })
  job: Job;

  @Column({ name: 'jobId', update: false })
  jobId: string;

  @CreateDateColumn()
  rejected_at: Date;
}
