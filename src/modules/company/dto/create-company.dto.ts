import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';
import { OperationalStatus } from '../entities/company.entity';
import { LocationDto } from '../../user/dto/create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CreateSocialMediaDto {
  @ApiPropertyOptional({ example: 'https://facebook.com/techcorp' })
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiPropertyOptional({ example: 'https://twitter.com/techcorp' })
  @IsOptional()
  @IsUrl()
  twitter?: string;

  @ApiPropertyOptional({ example: 'https://linkedin.com/company/techcorp' })
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @ApiPropertyOptional({ example: 'https://instagram.com/techcorp_official' })
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiPropertyOptional({ example: 'https://youtube.com/c/techcorp' })
  @IsOptional()
  @IsUrl()
  youtube?: string;

  @ApiPropertyOptional({ example: 'https://techcorp.hashnode.dev' })
  @IsOptional()
  @IsUrl()
  hashnode?: string;

  @ApiPropertyOptional({ example: 'https://twitch.tv/techcorp_live' })
  @IsOptional()
  @IsUrl()
  twitch?: string;

  @ApiPropertyOptional({ example: 'https://github.com/techcorp' })
  @IsOptional()
  @IsUrl()
  github?: string;
}

class CreateTaxInfoDto {
  @ApiPropertyOptional({
    example: 'TIN-123456789',
    description: 'Tax Identification Number',
  })
  @IsOptional()
  @IsString()
  tax_id?: string;

  @ApiPropertyOptional({
    example: 'VAT-987654321',
    description: 'Value Added Tax Number',
  })
  @IsOptional()
  @IsString()
  vat_number?: string;
}

export class CreateCompanyDto {
  @ApiProperty({
    example: 'contact@techcorp.com',
    description: 'Official company email',
  })
  @IsEmail({}, { message: 'Please enter a valid email' })
  @IsNotEmpty({ message: 'company email is required' })
  email: string;

  // @ApiProperty({ example: 1, description: 'User ID of the company owner' })
  // @IsNumber() // Note: Changed to IsNumber if ownerId is a number type
  // @IsNotEmpty({ message: 'company owner is required' })
  // ownerId: number;

  @ApiProperty({
    example: 'Tech Corp Global',
    description: 'Registered legal name',
  })
  @IsString()
  @IsNotEmpty({ message: 'company name is required' })
  company_name: string;

  @ApiPropertyOptional({
    example: 'https://techcorp.com',
    description: 'Official website URL',
  })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({
    type: LocationDto,
    description: 'Physical address of the company',
    example: {
      address: '123 Tech Street',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      latitude: 6.5244,
      longitude: 3.3792,
    },
  })
  @IsNotEmpty({ message: 'company address is required' })
  @ValidateNested()
  @Type(() => LocationDto)
  address: LocationDto;

  @ApiPropertyOptional({
    example: 'A leading provider of software solutions.',
    description: 'Short company bio',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/logo.png',
    description: 'URL to logo image',
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/cover.jpg',
    description: 'URL to cover image',
  })
  @IsOptional()
  @IsString()
  cover_image?: string;

  @ApiProperty({
    example: 'Information Technology',
    description: 'Industry category',
  })
  @IsString()
  @IsNotEmpty({ message: 'company category is required' })
  category: string;

  @ApiPropertyOptional({ example: 50, description: 'Number of employees' })
  @IsOptional()
  @IsNumber()
  employee_count?: number;

  @ApiPropertyOptional({
    example: 'Tech Holdings LLC',
    description: 'Name of parent company if applicable',
  })
  @IsOptional()
  @IsString()
  parent_company?: string;

  @ApiPropertyOptional({
    example: '2020-05-15',
    description: 'Date of incorporation (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  incorporation_date?: Date;

  @ApiPropertyOptional({
    example: '+2348012345678',
    description: 'Contact phone number',
  })
  @IsOptional()
  @IsPhoneNumber('NG', { message: 'Please enter a valid phone number' })
  contact_phone?: string;

  @ApiPropertyOptional({
    enum: OperationalStatus,
    example: OperationalStatus.ACTIVE, // Assuming ACTIVE is a value in your enum
    description: 'Current operational status',
  })
  @IsOptional()
  @IsEnum(OperationalStatus)
  operational_status?: OperationalStatus;

  @ApiPropertyOptional({ type: CreateTaxInfoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateTaxInfoDto)
  tax_info?: CreateTaxInfoDto;

  @ApiPropertyOptional({ type: CreateSocialMediaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSocialMediaDto)
  social_media?: CreateSocialMediaDto;
}

export class CompanyLogoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  logo: Express.Multer.File;
}
export class CompanyCoverImageDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  cover_image: Express.Multer.File;
}
