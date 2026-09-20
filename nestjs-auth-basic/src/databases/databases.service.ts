import { Permission, PermissionDocument } from '../permissions/schemas/permission.schema';
import { Role, RoleDocument } from '../roles/schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService,
    private userService: UsersService
  ) { }
  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (isInit?.trim().toLowerCase() !== 'true') {
      return;
    }

    const countUser = await this.userModel.countDocuments({});
    const initPassword = this.configService.get<string>('INIT_PASSWORD');
    if (countUser === 0 && !initPassword?.trim()) {
      throw new Error('INIT_PASSWORD is required to create sample users.');
    }

    const countPermission = await this.permissionModel.countDocuments({});
    const countRole = await this.roleModel.countDocuments({});

    // Create sample permissions only when the collection is empty.
    if (countPermission === 0) {
      await this.permissionModel.insertMany(INIT_PERMISSIONS);
    }

    // Create the default roles after permissions are available.
    if (countRole === 0) {
      const permissions = await this.permissionModel.find({}).select('_id');
      await this.roleModel.insertMany([
        {
          name: ADMIN_ROLE,
          description: 'Quản trị viên có toàn bộ quyền',
          isActive: true,
          permissions: permissions.map(permission => permission._id),
        },
        {
          name: USER_ROLE,
          description: 'Người dùng/Ứng viên sử dụng hệ thống',
          isActive: true,
          permissions: [],
        },
      ]);
    }

    // Create sample users after their roles are available.
    if (countUser === 0) {
      const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
      const userRole = await this.roleModel.findOne({ name: USER_ROLE });

      if (!adminRole || !userRole) {
        throw new Error('SUPER_ADMIN and NORMAL_USER roles are required to create sample users.');
      }

      await this.userModel.insertMany([
        {
          name: "I'm admin",
          email: 'admin@gmail.com',
          password: this.userService.getHashPassword(initPassword),
          age: '69',
          gender: 'MALE',
          address: 'VietNam',
          role: adminRole._id,
        },
        {
          name: "I'm Hỏi Dân IT",
          email: 'hoidanit@gmail.com',
          password: this.userService.getHashPassword(initPassword),
          age: '96',
          gender: 'MALE',
          address: 'VietNam',
          role: adminRole._id,
        },
        {
          name: "I'm normal user",
          email: 'user@gmail.com',
          password: this.userService.getHashPassword(initPassword),
          age: '69',
          gender: 'MALE',
          address: 'VietNam',
          role: userRole._id,
        },
      ]);
    }

    if (countUser > 0 && countRole > 0 && countPermission > 0) {
      this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
    }
  }
}
