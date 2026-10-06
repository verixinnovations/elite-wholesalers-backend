import { IsEmail, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ContactUsDto {
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstname: string;

  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastname: string;

  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsString()
  @IsNotEmpty({ message: 'Message cannot be empty' })
  message: string;
}
