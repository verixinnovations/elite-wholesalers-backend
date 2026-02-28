import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsNumber,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer'; // Update path as needed
import { ApplicationStatus } from '../entities/job-applicants.entity';

// 1. Helper DTO for the JSONB column (InterviewFeedback)
export class InterviewDto {
  @ApiProperty({ example: '2025-12-28T10:00:00Z' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 'Candidate showed strong technical skills.' })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'https://meet.google.com/jhfk-kfh-llj' })
  @IsString()
  @IsNotEmpty()
  meeting_link: string;
}

// 2. Main Create DTO
export class JobApplicantsDto {
  @ApiProperty({ description: 'The UUID of the Job being applied for' })
  @IsUUID()
  @IsNotEmpty()
  jobId: string;

  // Note: Depending on your logic, userId might come from the Auth Token (req.user.id)
  // instead of the body. If passed in body, keep this:
  @ApiProperty({ description: 'The UUID of the Applicant' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiPropertyOptional({
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
    example: ApplicationStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ description: 'Cover letter text' })
  @IsOptional()
  @IsString()
  cover_letter?: string;

  @ApiPropertyOptional({ type: InterviewDto })
  @IsOptional()
  interview_details?: InterviewDto;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  evaluation_score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateApplicationDto {
  @ApiPropertyOptional({
    example: 'I am very interested in this role because...',
    description: 'Optional cover letter (max 5000 chars)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(5000, {
    message: 'Cover letter is too long (max 5000 characters)',
  })
  cover_letter?: string;
}
export class RecruiterUpdateApplicationDto {
  @ApiPropertyOptional({
    enum: ApplicationStatus,
    default: ApplicationStatus.SUBMITTED,
    example: ApplicationStatus.SUBMITTED,
  })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({ type: InterviewDto })
  @IsOptional()
  @Type(() => InterviewDto)
  interview_details?: InterviewDto;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  evaluation_score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
