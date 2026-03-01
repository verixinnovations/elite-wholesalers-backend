export enum UserRoles {
  USER = 'USER',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsArray,
  IsDateString,
  ValidateNested,
  MaxLength,
  IsPhoneNumber,
  IsNumber,
} from 'class-validator';

// 1. Define the Location Object Structure
export class LocationDto {
  @ApiProperty({ example: '123 Tech Road' })
  @IsOptional()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Ikeja' })
  @IsOptional()
  @IsString()
  city: string;

  @ApiProperty({ example: 'Lagos' })
  @IsOptional()
  @IsString()
  state: string;

  @ApiProperty({ example: 'Nigeria' })
  @IsOptional()
  @IsString()
  country: string;

  @IsOptional()
  postal_code?: string | number;

  @IsOptional()
  zip_code?: string | number;

  @ApiProperty({ example: 7.45 })
  @IsOptional()
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 3.46 })
  @IsOptional()
  @IsNumber()
  longitude: number;
}

export class CreateUserDto {
  @ApiProperty({ example: 'Samson' })
  @IsString()
  @MinLength(2, { message: 'firstname must have atleast 2 characters.' })
  @IsNotEmpty()
  firstname: string;

  @ApiProperty({ example: 'Realgreat' })
  @IsString()
  @MinLength(2, { message: 'lastname must have atleast 2 characters.' })
  @IsNotEmpty()
  lastname: string;

  @ApiProperty({ example: 'drcodes' })
  @IsNotEmpty()
  @MinLength(3, { message: 'username must have atleast 3 characters.' })
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can only contain letters, numbers, and underscores',
  })
  @IsOptional()
  username: string;

  @ApiProperty({ example: UserRoles.USER })
  @IsEnum(UserRoles, {
    message: `role must be a valid enum value: ${Object.values(UserRoles).join(', ')}`,
  })
  @IsOptional()
  role: UserRoles;

  @ApiProperty({ example: 'samsonrealgreat@gmail.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'please provide valid Email.' })
  email: string;

  @ApiProperty({ example: '#StrongPass@1' })
  @IsNotEmpty()
  @MinLength(6, { message: 'password must be at least 6 characters long.' })
  password: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  picture: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsEnum(['female', 'male', 'unspecified'], {
    message: `gender must be either male, female or unspecified}`,
  })
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: '+2348012345678', required: false })
  @IsOptional()
  @IsPhoneNumber()
  @IsString()
  phone_number?: string;

  @ApiProperty({ example: '1995-12-25', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  @ValidateNested() // Validates the object inside
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiProperty({ example: 'Full detailed biography...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ example: 'Full detailed biography...', required: false })
  @IsOptional()
  @IsString()
  rejectedJobs?: string;

  @ApiProperty({ example: 'Software Engineer based in Lagos', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(150, { message: 'short bio is too long (max 150 chars)' })
  short_bio?: string;

  @ApiProperty({ example: ['TypeScript', 'NestJS', 'Vue'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiProperty({ example: ['Web Development', 'Consulting'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  services?: string[];
}

export class UserProfilePhotoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  picture: Express.Multer.File;
}

export class UpdateRoleDto {
  @ApiProperty({ example: UserRoles.USER })
  @IsEnum(UserRoles, {
    message: `role must be a valid enum value: ${Object.values(UserRoles).join(', ')}`,
  })
  @IsOptional()
  role: UserRoles;
}
