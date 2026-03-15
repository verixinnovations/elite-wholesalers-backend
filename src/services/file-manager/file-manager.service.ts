import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CloudinaryService } from 'nestjs-cloudinary';
import { Express } from 'express';

@Injectable()
export class FileManagerService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  async uploadImage(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'auto',
      folder: 'images',
    });
    if (result.secure_url) {
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        name: file.originalname,
      };
    } else throw new BadGatewayException('Image upload failed');
  }
  async uploadResume(file: Express.Multer.File) {
    // 1. Strict PDF-only validation
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Invalid file format. Only PDF documents are accepted as resumes.',
      );
    }
    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'auto',
      folder: 'resumes',
    });

    if (result.secure_url) {
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: 'pdf',
        name: file.originalname,
      };
    } else {
      throw new BadGatewayException('Resume upload failed');
    }
  }
}
