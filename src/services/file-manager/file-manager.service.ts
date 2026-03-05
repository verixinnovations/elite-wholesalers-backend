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
      console.log({ file, result });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        name: file.originalname,
      };
    } else throw new BadGatewayException('Image upload failed');
  }
  async uploadResume(file: Express.Multer.File) {
    if (file.mimetype.startsWith('image/')) {
      throw new BadRequestException(
        'Images are not allowed as resumes. Please upload a PDF or Word document.',
      );
    }

    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'raw',
      folder: 'resumes',
    });
    if (result.secure_url) {
      console.log({ file, result });
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format || file.originalname.split('.').pop(),
        name: file.originalname,
      };
    } else throw new BadGatewayException('Resume upload failed');
  }
}
