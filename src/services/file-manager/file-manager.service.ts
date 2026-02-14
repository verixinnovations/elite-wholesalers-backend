import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CloudinaryService } from 'nestjs-cloudinary';
import { Express } from 'express';

@Injectable()
export class FileManagerService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}
  async uploadImage(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file);
    if (result.secure_url)
      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    else throw new InternalServerErrorException('Image upload failed');
  }
}
