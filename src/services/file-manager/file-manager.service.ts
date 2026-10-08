import {
  BadGatewayException,
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { CloudinaryService } from 'nestjs-cloudinary';

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
    } else throw new BadGatewayException('Image upload failed');
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
      throw new BadGatewayException(
        'Product specs upload failed upload failed',
      );
    }
  }
}
