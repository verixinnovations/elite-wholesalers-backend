import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BcryptConfig } from '../../../common/utils/bcrypt.utils';
import { AccountType } from '../dto/create-user.dto';
import { Exclude } from 'class-transformer';
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

export interface BusinessDetails {
  abn: string;
  acn?: string;
  abn_verfied?: boolean;
  business_name: string;
  business_type: string;
  business_website?: string;
  industry: string;
  license_number: string;
  license_verfied?: boolean;
  stateIssued: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: true,
    unique: true,
  })
  zohoContactId: string;

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
    enum: AccountType,
    default: AccountType.INDIVIDUAL,
  })
  accountType: AccountType;

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
  date_of_birth: string;

  @Column({ type: 'varchar', length: 24, nullable: true })
  phone_number: string;

  // Storing Location as a JSON object (e.g. { city: "Lagos", country: "Nigeria", address: "..." })
  @Column({ type: 'jsonb', nullable: true })
  location: Location;

  @Column({ type: 'jsonb', nullable: true })
  business_details: BusinessDetails;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'boolean', default: false })
  is_profile_completed: boolean;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  updateFullname() {
    if (this.firstname && this.lastname) {
      this.fullname = this.firstname + ' ' + this.lastname;
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  checkProfileCompletion() {
    const requiredFields = [
      this.firstname,
      this.lastname,
      this.email,
      this.date_of_birth,
      this.picture,
    ];

    // Check if simple fields are filled
    const hasBasicInfo = requiredFields.every(
      (field) => field !== null && field !== undefined && field !== '',
    );

    this.is_profile_completed = hasBasicInfo;
  }

  @BeforeInsert()
  generateCustomUsername() {
    if (!this.username) {
      const randomChars = Math.random().toString(36).substring(2, 10);
      this.username = `ewhls-${randomChars}`;
    }
  }

  async validatePassword(plainPassword: string): Promise<boolean> {
    return BcryptConfig.comparePassword(plainPassword, this.password);
  }
}
