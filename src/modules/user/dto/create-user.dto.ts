export enum AccountType {
  TRADER = 'TRADER',
  INDIVIDUAL = 'INDIVIDUAL',
  ADMIN = 'ADMIN',
}

import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  IsDateString,
  ValidateNested,
  IsPhoneNumber,
  IsNumber,
  IsUrl,
  IsIn,
  ValidateIf,
  IsDefined,
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
  @ApiProperty({ example: 320345 })
  postal_code?: string | number;

  @IsOptional()
  @ApiProperty({ example: 47837 })
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

const BUSINESS_TYPES = [
  'partnership',
  'sole_trader',
  'company',
  'trust',
] as const;

const AUS_STATES = [
  'nsw',
  'vic',
  'qld',
  'wa',
  'sa',
  'tas',
  'act',
  'nt',
] as const;

export class BusinessDetailsDto {
  @ApiProperty({ example: '88172828288' })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'ABN must be exactly 11 digits' })
  abn: string;

  @ApiProperty({ example: '663263273' })
  @IsString()
  @IsOptional()
  @Matches(/^\d{9}$/, { message: 'ACN must be exactly 9 digits' })
  acn?: string;

  @ApiProperty({ example: 'ELITE WHOLESALERS' })
  @IsString()
  business_name: string;

  @ApiProperty({ example: 'company' })
  @IsString()
  @IsIn(BUSINESS_TYPES, {
    message: `business_type must be one of: ${BUSINESS_TYPES.join(', ')}`,
  })
  business_type: string;

  @ApiProperty({ example: 'https://www.elitewholesalers.com' })
  @IsOptional()
  @IsUrl({}, { message: 'business_website must be a valid URL' })
  business_website?: string;

  @ApiProperty({ example: 'Agro-Allied' })
  @IsString()
  industry: string;

  @ApiProperty({ example: '1765FC' })
  @IsString()
  license_number: string;

  @ApiProperty({ example: 'nsw' })
  @IsString()
  @IsIn(AUS_STATES, {
    message: `stateIssued must be one of: ${AUS_STATES.join(', ')}`,
  })
  stateIssued: string;
}

export class CreateUserDto {
  @Exclude()
  @ApiProperty({ example: '674p-d930-382n-2dfa' })
  @IsOptional()
  @IsString()
  id: string;

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

  @ApiProperty({ example: AccountType.INDIVIDUAL })
  @IsEnum(AccountType, {
    message: `role must be a valid enum value: ${Object.values(AccountType).join(', ')}`,
  })
  @IsOptional()
  accountType: AccountType;

  @ApiProperty({ example: 'samsonrealgreat+18@gmail.com' })
  @IsNotEmpty()
  @IsEmail({}, { message: 'Please provide valid Email.' })
  email: string;

  @ApiProperty({ example: '#StrongPass@1' })
  @IsNotEmpty()
  @MinLength(6, { message: 'password must be at least 6 characters long.' })
  password: string;

  @ApiProperty({ example: '', required: false })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiProperty({ example: 'male' })
  @IsString()
  @IsEnum(['female', 'male', 'unspecified'], {
    message: `gender must be either male, female or unspecified}`,
  })
  @IsOptional()
  gender?: string;

  @ApiProperty({ example: '+2348012345478', required: false })
  @IsOptional()
  @IsPhoneNumber()
  @IsString()
  phone_number?: string;

  @ApiProperty({ example: '1995-12-25', required: false })
  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @ApiProperty({
    required: false,
    description: 'Required if accountType is TRADER',
    type: () => BusinessDetailsDto,
  })
  @ValidateIf((object) => object.accountType === AccountType.TRADER)
  @ValidateNested()
  @Type(() => BusinessDetailsDto)
  @IsNotEmpty()
  business_details: BusinessDetailsDto;

  @ApiProperty({ type: LocationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  @ApiProperty({ example: 'Full detailed bio...', required: false })
  @IsOptional()
  @IsString()
  bio?: string;
}

export class UserProfilePhotoDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  picture: Express.Multer.File;
}

export class UpdateRoleDto {
  @ApiProperty({ example: AccountType.INDIVIDUAL })
  @IsEnum(AccountType, {
    message: `role must be a valid enum value: ${Object.values(AccountType).join(', ')}`,
  })
  @IsOptional()
  accountType: AccountType;
}

export class CheckDuplicateDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsDefined()
  @IsNotEmpty()
  value: any;
}
export class SupportedStatesDto {
  @IsString()
  @IsNotEmpty({ message: 'Country is required.' })
  country: string;
}
export class SupportedCitiesDto {
  @IsString()
  @IsNotEmpty({ message: 'Country is required.' })
  country: string;

  @IsString()
  @IsNotEmpty({ message: 'State is required.' })
  state: string;
}
