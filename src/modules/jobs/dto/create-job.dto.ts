import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
  ArrayNotEmpty,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  ExperienceLevel,
  JobLocationType,
  JobType,
} from '../entities/job.entity'; // Adjust path if needed

// --- Nested DTOs (for JSONB columns) ---

class JobDurationDto {
  @ApiProperty({
    enum: ['week', 'month', 'year'],
    example: 'month',
    description: 'Unit of time for the contract duration',
  })
  @IsEnum(['week', 'month', 'year'], {
    message: 'Duration must be week, month, or year',
  })
  date: 'week' | 'month' | 'year';

  @ApiProperty({ example: 6, description: 'Duration value (e.g., 6 months)' })
  @IsNumber()
  @Min(1)
  value: number;
}

class JobSalaryDto {
  @ApiProperty({ example: 'NGN', description: 'Currency code (ISO 4217)' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({ example: 250000, description: 'Salary amount' })
  @IsNumber()
  @Min(0)
  value: number;
}

export class CreateJobDto {
  @ApiProperty({
    example: 'Senior Backend Engineer',
    description: 'Title of the job position',
  })
  @IsString()
  @IsNotEmpty()
  job_title: string;

  @ApiProperty({
    example: 'We are looking for an experienced developer...',
    description: 'Detailed job description',
  })
  @IsString()
  @IsNotEmpty()
  job_description: string;

  @ApiProperty({
    enum: JobType,
    example: JobType.FULL_TIME, // Ensure JobType enum is imported/defined correctly
    description: 'Type of employment',
  })
  @IsEnum(JobType)
  job_type: JobType;

  @ApiProperty({
    example: '2025-12-31T23:59:59Z',
    description: 'Application deadline (ISO Date)',
  })
  @IsDateString(
    {},
    { message: 'application_ends must be a valid ISO date string' },
  )
  application_ends: Date;

  @ApiProperty({
    type: JobDurationDto,
    description: 'Duration of the contract/job',
  })
  @ValidateNested()
  @Type(() => JobDurationDto)
  @IsNotEmpty()
  job_duration: JobDurationDto;

  @ApiProperty({ type: JobSalaryDto, description: 'Salary details' })
  @ValidateNested()
  @Type(() => JobSalaryDto)
  @IsNotEmpty()
  salary: JobSalaryDto;

  @ApiProperty({
    type: [String], // Swagger: Denotes an array of strings
    description: 'List of required technical skills',
    example: ['Vue.js', 'NestJS'],
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one skill is required' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  @Transform(({ value }: { value: string }) => [...new Set(value)])
  required_skills: string[];

  @ApiProperty({
    enum: JobLocationType,
    example: JobLocationType.REMOTE,
    description: 'Location type (Remote, On-site, Hybrid)',
  })
  @IsEnum(JobLocationType)
  job_location_type: JobLocationType;

  @ApiProperty({
    enum: ExperienceLevel,
    example: ExperienceLevel.SENIOR,
    description: 'Required experience level',
  })
  @IsEnum(ExperienceLevel)
  experience_level: ExperienceLevel;

  @ApiProperty({
    type: [String],
    description: 'List of job requirements (education, experience, etc.)',
    example: [
      'Bachelor’s Degree in CS',
      '3+ years of experience',
      'Strong communication skills',
    ],
    uniqueItems: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one requirement is listed' })
  @IsString({ each: true, message: 'Each requirement must be a string' })
  @Transform(({ value }: { value: string }) => [...new Set(value)])
  requirements: string[];

  @ApiProperty({
    type: [String],
    description: 'List of perks and benefits offered',
    example: ['Health Insurance', 'Remote Work', 'Annual Retreat'],
    uniqueItems: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one benefit must be listed' }) // Change to @IsOptional() if benefits aren't mandatory
  @IsString({ each: true, message: 'Each benefit must be a string' })
  @Transform(({ value }: { value: string }) => [...new Set(value)])
  benefits: string[];
}

export class JobSearchDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(JobLocationType)
  locationType?: JobLocationType;

  @IsOptional()
  @IsString()
  jobLocation?: string;

  @IsOptional()
  @IsEnum(ExperienceLevel)
  experience?: ExperienceLevel;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minSalary?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxSalary?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit?: number = 10;
}
