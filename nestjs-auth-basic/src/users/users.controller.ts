import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './users.interface';
import { Public, ResponseMessage, SkipPermission, User } from '@/decorator/customize';
import { UpdatePhoneDto, ChangePasswordDto } from './dto/account-settings.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Patch('me/phone')
  @SkipPermission()
  updatePhone(@Body() dto: UpdatePhoneDto, @User() user: IUser) {
    return this.usersService.updatePhone(dto, user);
  }

  @Patch('me/password')
  @SkipPermission()
  changePassword(@Body() dto: ChangePasswordDto, @User() user: IUser) {
    return this.usersService.changePassword(dto, user);
  }

  @Post()
  @ResponseMessage('Create a new user')
  async create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    }
  }
  
  @Get()
  @ResponseMessage('Fetch user with pagination')
  findAll(@Query('current') currentPage: string,
    @Query('pageSize') limitPage: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limitPage, qs)
  }

  @Public()
  @Get(':id')
  @ResponseMessage('Fetch user by Id')
  findOne(@Param('id') id: string): Promise<unknown> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update a new user')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @User() user: IUser): Promise<unknown> {
    return this.usersService.update({ ...updateUserDto, _id: id }, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a new user')
  remove(@Param('id') id: string, @User() user: IUser): Promise<unknown> {
    return this.usersService.remove(id, user);
  }
}
