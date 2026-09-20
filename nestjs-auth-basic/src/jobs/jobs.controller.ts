import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '@/auth/optional-jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { IUser } from '@/users/users.interface';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  @ResponseMessage('Create a new job')
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.create(createJobDto, user);
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get()
  @ResponseMessage('Fetch job with pagination')
  findAll(@Query('current') currentPage: string,
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
    @User() user?: IUser,
  ) {
    return this.jobsService.findAll(+currentPage, +limitPage, qs, user)
  }

  @Public()
  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @User() user?: IUser) {
    return this.jobsService.findOne(id, user);
  }

  @Patch(':id')
  @ResponseMessage('Update a job')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    return this.jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a job')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.jobsService.remove(id, user);
  }
}
