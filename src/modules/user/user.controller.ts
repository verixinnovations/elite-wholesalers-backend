import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  Put,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateRoleDto, UserProfilePhotoDto } from './dto/create-user.dto';
import type { IRequest } from '../../common/interface';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiBearerAuth()
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  findAll() {
    return this.userService.findAllUser();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: number) {
    return this.userService.viewUser(id);
  }

  @Patch('picture')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiBody({ description: 'Upload profile photo', type: UserProfilePhotoDto })
  @UseInterceptors(FileInterceptor('picture'))
  uploadProfilePicture(
    @Req() req: IRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.updateUserProfilePicture(req.user.id, file);
  }

  @Patch()
  @ApiOperation({ summary: 'Update user by ID' })
  update(@Req() req: IRequest, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUser(req.user.id, updateUserDto);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete user by ID' })
  remove(@Req() req: IRequest) {
    return this.userService.removeUser(req.user.id);
  }

  @Put('role')
  @ApiOperation({ summary: 'Update User Role ID' })
  updateRole(@Req() req: IRequest, @Body() userRole: UpdateRoleDto) {
    return this.userService.updateUserRole(req.user.id, userRole.role);
  }
}
