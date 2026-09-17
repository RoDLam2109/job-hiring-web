import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { IUser } from '@/users/users.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage('Create a new resume')
  create(@Body() createResumeDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createResumeDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch resume with pagination')
  findAll(@Query('current') currentPage: string,
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limitPage, qs)
  }

  @Post('by-user')
  @ResponseMessage('Fetch resume by user')
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUser(user);
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a resume')
  update(@Param('id') id: string, @Body() updateResumeDto: UpdateResumeDto, @User() user: IUser) {
    return this.resumesService.update(id, updateResumeDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a resume')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
