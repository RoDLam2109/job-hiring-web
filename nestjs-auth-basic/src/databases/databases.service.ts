import { PermissionDocument } from '@/permissions/schemas/permission.schema';
import { RoleDocument } from '@/roles/schemas/role.schema';
import { User, UserDocument } from '@/users/schemas/user.schema';
import { UsersService } from '@/users/users.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';

@Injectable()
export class DatabasesService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(User.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(User.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,
    private userService: UsersService
  ) { }
  onModuleInit() {
    console.log(`The module has been initialized. `)
  }
}
