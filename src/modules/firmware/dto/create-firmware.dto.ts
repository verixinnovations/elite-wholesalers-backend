import { IsString, IsUrl, IsUUID, MinLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFirmwareCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'documentation' })
  @IsString()
  @MinLength(1, { message: 'Category name is required' })
  name: string;

  @ApiProperty({
    description: 'Category title',
    example: 'Documentation & Guides',
  })
  @IsString()
  @MinLength(1, { message: 'Category title is required' })
  title: string;
}

export class CreateFirmwareItemDto {
  @ApiProperty({ description: 'Item title', example: 'Enterprise Suite' })
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @ApiProperty({ description: 'Item version', example: 'v1.2.0' })
  @IsString()
  @MinLength(1, { message: 'Version is required' })
  version: string;

  @ApiProperty({ description: 'Release date string', example: '2026-06-01' })
  @IsString()
  @MinLength(1, { message: 'Date is required' })
  date: string;

  @ApiProperty({ description: 'File size string', example: '45 MB' })
  @IsString()
  @MinLength(1, { message: 'Size is required' })
  size: string;

  @ApiProperty({
    description: 'Valid download link URL',
    example: 'https://example.com/file.zip',
  })
  @IsUrl({}, { message: 'Please enter a valid download URL' })
  downloadLink: string;

  @ApiProperty({
    description: 'Category UUID reference',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsUUID('4', { message: 'Valid Category ID is required' })
  categoryId: string;
}

export class ReorderDto {
  @ApiProperty({
    description: 'Array of IDs in the new desired sorted order',
    example: ['uuid-1', 'uuid-2'],
  })
  @IsArray()
  @IsUUID('4', {
    each: true,
    message: 'Each ID in the reorder array must be a valid UUID',
  })
  ids: string[];
}
