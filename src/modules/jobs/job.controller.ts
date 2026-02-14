import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateApplicationDto, CreateJobDto } from './dto/create-job.dto';
import { JobService } from './jobs.service';
import type { IRequest } from 'src/common/interface';
import { Public } from 'src/common/decorators';

@ApiTags('Jobs')
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Find all open jobs' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search keyword for jobs',
  })
  @ApiResponse({
    status: 200,
    description: 'List of open jobs.',
    type: [CreateJobDto],
  })
  findAll(@Query('search') search: string) {
    return this.jobService.findAllOpenJobs(search);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get single job details' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job details retrieved.',
    type: CreateJobDto,
  })
  findOnePublic(@Param('id') id: string) {
    return this.jobService.findOnePublic(id);
  }

  // ==========================================
  // APPLICANT ROUTES (User actions)
  // ==========================================

  @Post(':id/apply')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for a job' })
  @ApiParam({ name: 'id', description: 'Job ID to apply for' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Application submitted successfully.',
    type: CreateJobDto,
  })
  applyForJob(
    @Req() req: IRequest,
    @Param('id') jobId: string,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.jobService.applyForJob(req.user, jobId, dto);
  }

  @Get('/applications')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my job applications' })
  @ApiResponse({
    status: 200,
    description: 'List of applied jobs.',
    type: [CreateJobDto],
  })
  getMyApplications(@Req() req: IRequest) {
    return this.jobService.getAppliedJobs(req.user);
  }

  @Post(':id/bookmark')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bookmark a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job bookmarked successfully.' })
  toggle(@Req() req: IRequest, @Param('id') jobId: string) {
    return this.jobService.toggleBookmark(req.user.id, jobId);
  }

  @Get('bookmarks')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my bookmarked jobs' })
  @ApiResponse({
    status: 200,
    description: 'List of bookmarked jobs retrieved.',
  })
  getMyBookmarks(@Req() req: IRequest) {
    return this.jobService.getMyBookmarkedJobs(req.user.id);
  }
}
