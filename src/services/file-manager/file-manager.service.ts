// src/services/file-manager.service.ts
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CloudinaryService } from 'nestjs-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class FileManagerService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(file: Express.Multer.File) {
    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'auto',
      folder: 'profile-images',
    });
    if (result.secure_url) {
      return {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        name: file.originalname,
      };
    } else {
      throw new BadGatewayException('Image upload failed');
    }
  }

  async uploadProductSpecs(file: Express.Multer.File) {
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException(
        'Invalid file format. Only PDF documents are accepted as productSpecs.',
      );
    }
    const result = await this.cloudinaryService.uploadFile(file, {
      resource_type: 'auto',
      folder: 'product-specs',
    });

    if (result.secure_url) {
      return {
        url: result.secure_url as string,
        publicId: result.public_id,
        format: 'pdf',
        name: file.originalname,
      };
    } else {
      throw new BadGatewayException('Product specs upload failed');
    }
  }

  async deleteFile(publicId: string, resourceType?: 'image' | 'video' | 'raw') {
    try {
      if (resourceType) {
        return await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
          invalidate: true,
        });
      }
      try {
        return await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
          invalidate: true,
        });
      } catch {
        try {
          return await cloudinary.uploader.destroy(publicId, {
            resource_type: 'raw',
            invalidate: true,
          });
        } catch {
          return await cloudinary.uploader.destroy(publicId, {
            resource_type: 'video',
            invalidate: true,
          });
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new BadGatewayException(
        `Failed to delete file from Cloudinary: ${errorMessage}`,
      );
    }
  }
}
