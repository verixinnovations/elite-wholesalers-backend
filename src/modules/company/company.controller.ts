import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { UpdateCompanyDto } from './dto/update-company.dto';
import type { IRequest } from '../../common/interface';
import {
  CompanyCoverImageDto,
  CompanyLogoDto,
  CreateCompanyDto,
} from './dto/create-company.dto';
import { Roles } from 'src/common/decorators';
import { UserRoles } from '../user/dto/create-user.dto';
// import { Company } from './entities/company.entity';

@ApiTags('Companies') // Groups these endpoints in Swagger UI
@ApiBearerAuth() // Indicates these endpoints need a JWT/Token (if using AuthGuard)
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @Roles(UserRoles.RECRUITER)
  @ApiOperation({ summary: 'Create a new company' })
  @ApiBody({ type: CreateCompanyDto })
  @ApiResponse({
    status: 201,
    description: 'Company created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'User already owns a company or Company name taken.',
  })
  async createCompany(
    @Req() req: IRequest,
    @Body() createCompanyDto: CreateCompanyDto,
  ) {
    return this.companyService.create(req.user.id, createCompanyDto);
  }

  // GET /companies
  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'List of all companies retrieved successfully.',
  })
  async getAllCompanies() {
    return this.companyService.findAll();
  }

  // GET /companies/owned
  @Get('owned')
  @Roles(UserRoles.RECRUITER)
  @ApiOperation({ summary: 'Get current user company' })
  @ApiResponse({
    status: 200,
    description: 'Current company details retrieved.',
  })
  async getCurrentCompany(@Req() req: IRequest) {
    // In Nest, req.user is populated by the Passport strategy
    return this.companyService.findMyCompany(req.user);
  }

  // GET /companies/:company_id
  @Get(':companyId')
  @ApiOperation({ summary: 'Get Company By ID' })
  @ApiParam({
    name: 'companyId',
    description: 'The ID of the company to retrieve',
  })
  @ApiResponse({ status: 200, description: 'Company details retrieved.' })
  @ApiResponse({ status: 404, description: 'Company not found.' })
  async getSingleCompany(@Param('companyId') companyId: string) {
    return this.companyService.findOne(companyId);
  }

  // PATCH /companies/update
  @Put('')
  @Roles(UserRoles.RECRUITER)
  @ApiOperation({ summary: 'Update company details' })
  @ApiBody({ type: UpdateCompanyDto })
  @ApiResponse({ status: 200, description: 'Company updated successfully.' })
  async updateCompanyDetails(
    @Request() req: IRequest,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return this.companyService.update(req.user, updateCompanyDto);
  }

  // POST /companies/upload-logo
  @Put(':companyId/upload-logo')
  @Roles(UserRoles.RECRUITER)
  @UseInterceptors(FileInterceptor('logo'))
  @ApiOperation({ summary: 'Upload company logo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully.' })
  @ApiBody({ description: 'Upload company logo', type: CompanyLogoDto })
  async uploadLogo(
    @Request() req: IRequest,
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.uploadLogo(companyId, file);
  }

  // POST /companies/upload-cover
  @Put(':companyId/upload-cover')
  @Roles(UserRoles.RECRUITER)
  @UseInterceptors(FileInterceptor('cover_image'))
  @ApiOperation({ summary: 'Upload cover image' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 200,
    description: 'Cover image uploaded successfully.',
    type: CreateCompanyDto,
  })
  @ApiBody({ description: 'Upload cover photo', type: CompanyCoverImageDto })
  async uploadCoverImage(
    @Request() req: IRequest,
    @Param('companyId') companyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.uploadCoverImage(companyId, file);
  }
}
