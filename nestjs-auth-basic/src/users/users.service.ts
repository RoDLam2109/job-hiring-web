import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { createHash } from 'crypto';
import { IUser } from './users.interface';
import { error } from 'console';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import { Role, RoleDocument } from '@/roles/schemas/role.schema';
import { USER_ROLE } from '../databases/sample';
import { UpdatePhoneDto, ChangePasswordDto } from './dto/account-settings.dto';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,
  ) { }

  async updatePhone(dto: UpdatePhoneDto, user: IUser) {
    const profile = { phone: dto.phone, ...(dto.name !== undefined ? { name: dto.name.trim() } : {}) };
    const result = await this.userModel.updateOne(
      { _id: user._id, isDeleted: { $ne: true } },
      { $set: profile },
    );
    if (!result.matchedCount) throw new BadRequestException('Không tìm thấy tài khoản');
    return profile;
  }

  async changePassword(dto: ChangePasswordDto, user: IUser) {
    const account = await this.userModel.findOne({ _id: user._id });
    if (!account || !this.isValidPassword(dto.currentPassword, account.password)) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }
    if (Buffer.byteLength(dto.newPassword, 'utf8') > 72) {
      throw new BadRequestException('Mật khẩu mới không được vượt quá 72 byte');
    }
    if (this.isValidPassword(dto.newPassword, account.password)) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại');
    }
    const result = await this.userModel.updateOne(
      { _id: user._id, password: account.password, isDeleted: { $ne: true } },
      { $set: { password: this.getHashPassword(dto.newPassword), refreshToken: null } },
    );
    if (!result.matchedCount) throw new BadRequestException('Mật khẩu đã thay đổi, vui lòng thử lại');
    return { changed: true };
  }

  async findAll(currentPage: number, limitPage: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limitPage);
    let defaultLimit = +limitPage ? +limitPage : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let sortBy = sort
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sortBy = "-updatedAt"
    }

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // ignore a line below @ts-ignore: Unreachable code error
      .sort(sortBy as any)
      .select('-password')
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, // trang hiện tại
        pageSize: limitPage, // số lượng bản ghi đã lấy
        pages: totalPages, // tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result // kết quả query
    }
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const { name, email, password, age, gender, address, role, company } = createUserDto
    const hashPassword = this.getHashPassword(createUserDto.password);
    const isExist = await this.userModel.findOne({ email })

    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống ! Vui lòng sử dụng email khác !`)
    }
    let newUser = await this.userModel.create({
      name: name, email,
      password: hashPassword,
      age, gender, address,
      role,
      company, createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return newUser;
  }

  getHashPassword(password: string) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    return hash;
  }
  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user
    const isExist = await this.userModel.findOne({ email })
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại trên hệ thống ! Vui lòng sử dụng email khác !`)
    }
    // Fetch user role before creating the account.
    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    if (!userRole) {
      throw new BadRequestException(`Chưa có role ${USER_ROLE} trong database.`);
    }

    const hashPassword = this.getHashPassword(password);
    let newRegister = await this.userModel.create({
      name, email,
      password: hashPassword,
      age, gender, address,
      role: userRole?._id
    })
    return newRegister;
  }
  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`id ${id} không hợp lệ`)
    }

    return await this.userModel.findOne({
      _id: id
    }).select("-password") //exclude >< include
      .populate({
        path: 'role',
        select: { name: 1, _id: 1 }
      });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  async findOneByUserName(username: string) {
    return await this.userModel.findOne({
      email: username
    })
      .populate({
        path: 'role',
        select: { name: 1 }
      });
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id }, // điều kiện find user by id to update
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id, // gán IUser vào để biết ai cập nhật
          email: user.email
        }
      }
    );
  }

  async remove(id: string, user: IUser) {
    //admin@gmail.com

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`id ${id} không hợp lệ`)
    }

    const foundUser = await this.userModel.findById(id)
    if (foundUser && foundUser.email === 'admin@gmail.com') {
      throw new BadRequestException('Không thể xóa tài khoản admin')
    }

    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return await this.userModel.softDelete({
      _id: id
    });
  }


  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  checkPassword(hash: string, plain: string) {
    return compareSync(hash, plain);
  }

  updateUserToken = async (_id: string, refreshToken: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    )
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
      .populate({
        path: 'role',
        select: { name: 1 }
      })
  }
}
