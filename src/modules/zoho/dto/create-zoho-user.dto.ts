import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  MaxLength,
  IsInt,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType, LocationDto } from '../../user/dto/create-user.dto';

export enum ContactType {
  CUSTOMER = 'customer',
}

export class ContactPersonDto {
  @IsString()
  @IsOptional()
  first_name?: string;

  @IsString()
  @IsOptional()
  last_name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  mobile?: string;

  @IsBoolean()
  @IsOptional()
  is_primary_contact?: boolean;
}

export class CustomFieldDto {
  @IsInt()
  index: number;

  @IsString()
  value: string;

  @IsString()
  @IsOptional()
  label?: string;
}

export class CustomFieldDataDto {
  @IsEnum(AccountType)
  @IsOptional()
  account_type?: AccountType = AccountType.INDIVIDUAL;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  user_id: string;

  @IsString()
  @IsNotEmpty()
  abn: string;

  @IsString()
  @IsNotEmpty()
  acn: string;

  @IsString()
  @IsNotEmpty()
  licence_number?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsOptional()
  company_name?: string;
}

export class CreateContactDto {
  @IsString()
  @MaxLength(200)
  contact_name: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  company_name?: string;

  @IsEnum(ContactType)
  @IsOptional()
  contact_type?: ContactType = ContactType.CUSTOMER;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  language_code?: string;

  @IsString()
  @IsOptional()
  currency_id?: string;

  @IsInt()
  @IsOptional()
  payment_terms?: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  facebook?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  twitter?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ContactPersonDto)
  @IsOptional()
  contact_persons?: ContactPersonDto[];

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  billing_address?: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  @IsOptional()
  shipping_address?: LocationDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldDto)
  @IsOptional()
  custom_fields?: CustomFieldDto[];
}
