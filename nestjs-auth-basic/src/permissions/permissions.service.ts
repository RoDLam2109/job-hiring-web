import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from '@/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import mongoose from 'mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import { User } from '@/decorator/customize';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,
  ) { }
  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { apiPath, method } = createPermissionDto
    if (await this.permissionModel.findOne({ apiPath, method })) {
      throw new BadRequestException(`API: ${method} ${apiPath} đã tồn tại! Vui lòng chọn lại API khác`)
    }
    const newPermission = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return newPermission
  }

  async findAll(currentPage: number, pageSize: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let sortBy = sort
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sortBy = "-updatedAt"
    }

    const result = await this.permissionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // ignore a line below @ts-ignore: Unreachable code error
      .sort(sortBy as any)
      .populate(population)
      .exec();
    return {
      meta: {
        current: currentPage, // trang hiện tại
        pageSize: pageSize, // số lượng bản ghi đã lấy
        pages: totalPages, // tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result // kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`id ${id} không hợp lệ`)
    }
    return await this.permissionModel.findOne({ _id: id });
  }

  async update(_id: string, updatePermissionDto: UpdatePermissionDto) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`)
    }
    return await this.permissionModel.updateOne(
      { _id },
      {
        ...updatePermissionDto
      }
    );
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`)
    }
    await this.permissionModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return await this.permissionModel.softDelete({ _id })
  }
}
