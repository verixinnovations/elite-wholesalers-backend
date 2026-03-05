import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Req,
  UseInterceptors,
  UploadedFile,
  Put,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
} from '@nestjs/swagger';
import {
  UpdateRoleDto,
  UserProfilePhotoDto,
  UserResumeDto,
} from './dto/create-user.dto';
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

  @Get('profile-summary')
  @ApiOperation({ summary: 'Get user profile summary' })
  getProfileSummary(@Req() req: IRequest) {
    return this.userService.getUserProfileSummary(req.user.id);
  }

  @Put('picture')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload profile picture' })
  @ApiBody({ description: 'Upload profile photo', type: UserProfilePhotoDto })
  @UseInterceptors(FileInterceptor('picture'))
  uploadProfilePicture(
    @Req() req: IRequest,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userService.uploadPicture(req.user.id, file);
  }

  @Put('resume')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload resume' })
  @ApiBody({ description: 'Upload resume', type: UserResumeDto })
  @UseInterceptors(FileInterceptor('resume'))
  uploadResume(
    @Req() req: IRequest,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.userService.uploadResume(req.user.id, file);
  }

  @Put()
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

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    return this.userService.viewUser(id);
  }
}
