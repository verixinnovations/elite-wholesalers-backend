import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Index,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Job } from './job.entity';

@Entity('bookmarks')
@Index(['userId', 'jobId'], { unique: true })
export class Bookmark {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  jobId: string;

  @ManyToOne(() => User, (user) => user.bookmarks, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Job, (job) => job.bookmarks, { onDelete: 'CASCADE' })
  job: Job;

  @CreateDateColumn()
  createdAt: Date;
}
