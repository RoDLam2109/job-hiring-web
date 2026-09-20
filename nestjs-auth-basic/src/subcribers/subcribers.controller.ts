import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubcribersService } from './subcribers.service';
import { CreateSubcriberDto } from './dto/create-subcribers.dto';
import { UpdateSubcriberDto } from './dto/update-subcribers.dto';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { IUser } from '@/users/users.interface';

@Controller('subcribers')
export class SubcribersController {
  constructor(private readonly subcribersService: SubcribersService) { }

  @Post()
  @ResponseMessage('Create a new subcribers')
  create(@Body() createSubcriberDto: CreateSubcriberDto, @User() user: IUser) {
    return this.subcribersService.create(createSubcriberDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch subcriber with pagination')
  findAll(@Query('current') currentPage: string,
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
  ) {
    return this.subcribersService.findAll(+currentPage, +limitPage, qs)
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch subcriber by id')
  findOne(@Param('id') id: string) {
    return this.subcribersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a subcriber')
  update(@Param('id') id: string, @Body() updatesubcriberDto: UpdateSubcriberDto, @User() user: IUser) {
    return this.subcribersService.update(id, updatesubcriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a subcriber')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subcribersService.remove(id, user);
  }
}
