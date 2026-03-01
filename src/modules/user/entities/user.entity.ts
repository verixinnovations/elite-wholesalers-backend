import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BcryptConfig } from '../../../common/utils/bcrypt.utils';
import { UserRoles } from '../dto/create-user.dto';
import { Exclude } from 'class-transformer';
import { Bookmark } from '../../jobs/entities/job-bookmark.entity';
import { JobRejection } from 'src/modules/jobs/entities/job-rejected.entity';

export interface Location {
  country: string;
  state: string;
  area?: string;
  city: string;
  street: string;
  postal_code?: string | number;
  zip_code?: string | number;
  latitude: number;
  longitude: number;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30 })
  firstname: string;

  @Column({ type: 'varchar', length: 30 })
  lastname: string;

  @Column({ type: 'varchar' })
  fullname: string;

  @Column({
    type: 'varchar',
    length: 32,
    unique: true,
    transformer: {
      to: (value: string) => value?.toLowerCase().trim(),
      from: (value: string) => value,
    },
  })
  username: string;

  @Column({
    type: 'enum',
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: UserRoles;

  @Column({
    type: 'varchar',
    length: 120,
    unique: true,
    transformer: {
      to: (value: string) => value?.toLowerCase().trim(),
      from: (value: string) => value,
    },
  })
  email: string;

  @Column({ type: 'varchar', nullable: true })
  picture: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  password: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female', 'unspecified'],
    default: 'unspecified',
    nullable: true,
  })
  gender: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  // Storing Location as a JSON object (e.g. { city: "Lagos", country: "Nigeria", address: "..." })
  @Column({ type: 'jsonb', nullable: true })
  location: Location;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ length: 150, nullable: true }) // Short bio usually has a limit
  short_bio: string;

  @Column({ type: 'simple-array', nullable: true })
  skills: string[];

  @Column({ type: 'simple-array', nullable: true })
  services: string[];

  @OneToMany(() => Bookmark, (bookmark) => bookmark.user)
  bookmarks: Bookmark[];

  @OneToMany(() => JobRejection, (rejection) => rejection.user)
  rejected_jobs: JobRejection[];

  @BeforeInsert()
  @BeforeUpdate()
  updateFullname() {
    if (this.firstname && this.lastname) {
      this.fullname = this.firstname + ' ' + this.lastname;
    }
  }

  @BeforeInsert()
  generateCustomUsername() {
    if (!this.username) {
      const randomChars = Math.random().toString(36).substring(2, 10);
      this.username = `bdg-${randomChars}`;
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return BcryptConfig.comparePassword(plainPassword, this.password);
  }
}
