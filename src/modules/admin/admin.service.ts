import { Injectable } from '@nestjs/common';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';
import { FileManagerService } from '../../services/file-manager/file-manager.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly zohoInventoryService: ZohoInventoryService,
    private readonly fileManagerService: FileManagerService,
  ) {}

  async uploadProductSpecs(productId: string, specFile: Express.Multer.File) {
    const uploadFile =
      await this.fileManagerService.uploadProductSpecs(specFile);

    return await this.zohoInventoryService.uploadProductSpecs(
      productId,
      uploadFile.url,
    );
  }

  async deleteProductSpecs(productId: string) {
    await this.zohoInventoryService.clearProductSpecs(productId);
    // const uploadFile = await this.fileManagerService.deleteFile(specsUrl);
  }
}
