import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer'; // Update path as needed
import { ApplicationStatus } from '../entities/job-applicants.entity';

// 1. Helper DTO for the JSONB column (InterviewFeedback)
export class InterviewFeedbackDto {
  @ApiProperty({ example: '2025-12-28T10:00:00Z' })
  @IsDateString()
  date: Date;

  @ApiProperty({ example: 'Candidate showed strong technical skills.' })
  @IsString()
  @IsNotEmpty()
  comments: string;

  @ApiPropertyOptional({ example: 8.5 })
  @IsOptional()
  @IsNumber()
  score?: number;
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

  // --- Administrative Fields (Optional on Create) ---

  @ApiPropertyOptional({ type: [InterviewFeedbackDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InterviewFeedbackDto)
  interview_feedback?: InterviewFeedbackDto[];

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  evaluation_score?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    type: [Date],
    example: ['2025-12-30T09:00:00Z'],
  })
  @IsOptional()
  @IsArray()
  @IsDateString({}, { each: true })
  interview_dates?: Date[];
}
