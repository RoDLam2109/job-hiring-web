import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { CreateSubcriberDto } from './dto/create-subcribers.dto';
import { UpdateSubcriberDto } from './dto/update-subcribers.dto';
import { Public, ResponseMessage, SkipCheckPermission, User } from '@/decorator/customize';
import { IUser } from '@/users/users.interface';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  @Post()
  @ResponseMessage('Create a new subcribers')
  create(@Body() createSubcriberDto: CreateSubcriberDto, @User() user: IUser) {
    return this.subscribersService.create(createSubcriberDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage('Fetch subcriber with pagination')
  findAll(@Query('current') currentPage: string,
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
  ) {
    return this.subscribersService.findAll(+currentPage, +limitPage, qs)
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch subcriber by id')
  findOne(@Param('id') id: string) {
    return this.subscribersService.findOne(id);
  }

  @Post("skills")
  @ResponseMessage("Get subscriber's skills")
  @SkipCheckPermission()
  getUserSkills(@User() user: IUser) {
    return this.subscribersService.getSkills(user);
  }

  @Patch()
  @SkipCheckPermission()
  @ResponseMessage('Update a subcriber')
  update(@Body() updatesubcriberDto: UpdateSubcriberDto, @User() user: IUser) {
    return this.subscribersService.update(updatesubcriberDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a subcriber')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.subscribersService.remove(id, user);
  }
}
