import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductSpecsDto } from './dto/admin.dto';
import { ProductQueryDto } from '../products/dto/create-product.dto';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';
import { Roles } from '../../common/decorators';
import { UserService } from '../user/user.service';
import { AccountType, UpdateRoleDto } from '../user/dto/create-user.dto';

@Controller('admin')
@Roles(AccountType.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly userService: UserService,
    private readonly zohoInventoryService: ZohoInventoryService,
  ) {}

  @Post('/products/:productId/upload-specs')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product specs' })
  @ApiBody({ description: 'Upload product specs', type: ProductSpecsDto })
  @UseInterceptors(FileInterceptor('product_file'))
  uploadProfilePicture(
    @Param('productId') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.adminService.uploadProductSpecs(productId, file);
  }

  @Get('/products')
  @ApiOperation({ summary: 'List products' })
  async findAllProducts(@Query() query?: ProductQueryDto) {
    return await this.zohoInventoryService.getAdminInventoryItems(query);
  }

  @Get('/categories')
  @ApiOperation({ summary: 'List product categories' })
  async findAllCategories() {
    return await this.zohoInventoryService.getAdminInventoryCategories();
  }

  @Get('/users')
  @ApiOperation({ summary: 'List all users' })
  async findAllUsers() {
    return await this.userService.findAllUser();
  }

  @Put('/users/:userId/role')
  @ApiOperation({ summary: 'Update User Role ID' })
  updateRole(@Param('userId') userId: string, @Body() userRole: UpdateRoleDto) {
    return this.userService.updateUserRole(userId, userRole.accountType);
  }

  @Delete('/users/:userId')
  @ApiOperation({ summary: 'Delete user by ID' })
  remove(@Param('userId') userId: string) {
    return this.userService.removeUser(userId);
  }
}
