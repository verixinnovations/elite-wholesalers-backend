import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import type { IRequest } from '../../common/interface';
import { UserRoles } from '../user/dto/create-user.dto';
import { Roles } from '../../common/decorators';
import { CreateJobDto } from '../jobs/dto/create-job.dto';
import {
  JobApplicantsDto,
  RecruiterUpdateApplicationDto,
} from '../jobs/dto/applicants.dto';
import { UpdateJobDto } from '../jobs/dto/update-job.dto';
import { JobStatus } from '../jobs/entities/job.entity';
import { JobService } from '../jobs/jobs.service';

@ApiTags('Recruiter')
@Roles(UserRoles.RECRUITER)
@Controller('recruiter')
export class RecruiterController {
  constructor(private readonly jobService: JobService) {}

  @Post('jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new job posting' })
  @ApiBody({ type: CreateJobDto })
  @ApiResponse({ status: 201, description: 'Job created successfully.' })
  create(@Req() req: IRequest, @Body() createJobDto: CreateJobDto) {
    return this.jobService.create(req.user, createJobDto);
  }

  @Get('jobs')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get jobs posted by my company' })
  @ApiResponse({ status: 200, description: 'List of company jobs.' })
  findMyPostedJobs(@Req() req: IRequest) {
    return this.jobService.findMyJobs(req.user);
  }

  @Get('jobs/:jobId/applicants')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job applicants' })
  @ApiResponse({
    status: 200,
    description: 'List of jobs applicants.',
    type: [JobApplicantsDto],
  })
  getJobApplicants(@Req() req: IRequest, @Param('jobId') jobId: string) {
    return this.jobService.getJobApplicants(req.user.id, jobId);
  }

  @Get('jobs/:jobId/applicants/:applicantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single job applicant' })
  @ApiResponse({
    status: 200,
    description: 'Single job applicant retrieved.',
    type: JobApplicantsDto,
  })
  getJobApplicant(
    @Req() req: IRequest,
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
  ) {
    return this.jobService.getASingleJobApplicant(
      req.user.id,
      jobId,
      applicantId,
    );
  }

  @Put('jobs/:jobId/applicants/:applicantId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a single job applicant' })
  @ApiBody({ type: RecruiterUpdateApplicationDto })
  @ApiResponse({
    status: 200,
    description: 'Single job applicant updated successfully.',
    type: JobApplicantsDto,
  })
  updateJobApplicant(
    @Req() req: IRequest,
    @Body() data: RecruiterUpdateApplicationDto,
    @Param('jobId') jobId: string,
    @Param('applicantId') applicantId: string,
  ) {
    return this.jobService.updateJobApplicant(
      req.user.id,
      jobId,
      applicantId,
      data,
    );
  }

  @Get('jobs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single job posted by my company' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job details retrieved.',
    type: CreateJobDto,
  })
  findMySingleJob(@Req() req: IRequest, @Param('id') id: string) {
    return this.jobService.findMySingleJob(req.user, id);
  }

  @Put('jobs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job details' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({ type: UpdateJobDto })
  @ApiResponse({ status: 200, description: 'Job updated successfully.' })
  update(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return this.jobService.update(req.user, id, updateJobDto);
  }

  @Delete('jobs/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a job' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiResponse({ status: 200, description: 'Job deleted successfully.' })
  remove(@Req() req: IRequest, @Param('id') id: string) {
    return this.jobService.delete(req.user, id);
  }

  @Put('jobs/:id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update job status (e.g., OPEN, CLOSED)' })
  @ApiParam({ name: 'id', description: 'Job ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: Object.values(JobStatus),
          description: 'The new status of the job',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Job status updated.' })
  updateStatus(
    @Req() req: IRequest,
    @Param('id') id: string,
    @Body('status') status: JobStatus,
  ) {
    return this.jobService.updateJobStatus(req.user, id, status);
  }
}
