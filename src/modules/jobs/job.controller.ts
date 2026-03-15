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
import { CreateJobDto, JobSearchDto } from './dto/create-job.dto';
import { JobService } from './jobs.service';
import type { IRequest } from '../../common/interface';
import { Public } from '../../common/decorators';
import { CreateApplicationDto } from './dto/applicants.dto';

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
  findAll(@Query() search: JobSearchDto) {
    return this.jobService.findAllOpenJobs(search);
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

  @Get('reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get rejected jobs' })
  rejectJobs(@Req() req: IRequest) {
    return this.jobService.getrejectedJobs(req.user);
  }

  @Post(':id/reject')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reject a job' })
  @ApiParam({ name: 'id', description: 'Job ID to reject' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({
    status: 201,
    description: 'Application rejected successfully.',
    type: CreateJobDto,
  })
  rejectJob(@Req() req: IRequest, @Param('id') jobId: string) {
    return this.jobService.rejectJobFromSwipe(req.user, jobId);
  }

  @Get('swippable')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get swippable jobs' })
  @ApiResponse({
    status: 200,
    description: 'List of swippable jobs.',
    type: [CreateJobDto],
  })
  getSwippableJobs(@Req() req: IRequest) {
    return this.jobService.getSwippableJobs(req.user);
  }

  @Get('applications')
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

  @Get('applications/:jobId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get single job application' })
  @ApiResponse({
    status: 200,
    description: 'Get an applied job.',
    type: [CreateJobDto],
  })
  getMyJobApplication(@Req() req: IRequest, @Param('jobId') jobId: string) {
    return this.jobService.getSingleAppliedJob(req.user, jobId);
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

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get single job details' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job details retrieved.',
    type: CreateJobDto,
  })
  findOnePublic(@Param('id') id: string, @Req() req: IRequest) {
    return this.jobService.findOnePublic(id, req?.user?.id);
  }
}
