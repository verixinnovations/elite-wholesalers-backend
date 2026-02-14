import { type Location, User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';

// Interfaces to define the shape of the JSONB columns

export interface SocialMedia {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  hashnode?: string;
  twitch?: string;
  github?: string;
}

export interface TaxInfo {
  tax_id?: string;
  vat_number?: string;
}

export enum OperationalStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  RESTRUCTURING = 'restructuring',
  BANKRUPTCY = 'bankruptcy',
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'ownerId',
    update: false,
  })
  ownerId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, update: false })
  companyId: string;

  @Column({ default: 'company', update: false }) // Immutable via update: false
  status: string;

  @Column()
  company_name: string;

  @Column({ nullable: true })
  website: string;

  // Using 'jsonb' allows storing the nested object structure directly in Postgres
  @Column({ type: 'jsonb' })
  address: Location;

  @Column({ default: '' })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({ default: 'IT Company' })
  category: string;

  @Column({ default: 10 })
  employee_count: number;

  @Column({ nullable: true, default: null })
  parent_company: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  incorporation_date: Date;

  @Column({ nullable: true })
  contact_phone: string;

  @Column({
    type: 'enum',
    enum: OperationalStatus,
    default: OperationalStatus.ACTIVE,
  })
  operational_status: OperationalStatus;

  @Column({ type: 'jsonb', nullable: true })
  tax_info: TaxInfo;

  @Column({ type: 'jsonb', nullable: true })
  social_media: SocialMedia;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
