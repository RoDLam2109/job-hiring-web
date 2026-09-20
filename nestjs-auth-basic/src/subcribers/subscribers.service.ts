import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubcriberDto } from './dto/create-subcribers.dto';
import { UpdateSubcriberDto } from './dto/update-subcribers.dto';
import { IUser } from '@/users/users.interface';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Subcriber, SubcriberDocument } from './schemas/subcribers.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subcriber.name)
    private subcriberModel: SoftDeleteModel<SubcriberDocument>,
  ) { }
  async create(createSubcriberDto: CreateSubcriberDto, user: IUser) {
    const { email } = createSubcriberDto
    if (await this.subcriberModel.findOne({ email })) {
      throw new BadRequestException(`Email ${email} đã tồn tại! Vui lòng đặt 1 cái tên khác.`)
    }
    const newSubcriber = await this.subcriberModel.create({
      ...createSubcriberDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      name: newSubcriber.name,
      email: newSubcriber.email
    }
  }

  async findAll(currentPage: number, pageSize: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = (await this.subcriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let sortBy = sort
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sortBy = "-updatedAt"
    }

    const result = await this.subcriberModel.find(filter)
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
    return await this.subcriberModel.findOne({ _id: id })
  }

  async update(updatesubcriberDto: UpdateSubcriberDto, user: IUser) {
    const updated = await this.subcriberModel.updateOne(
      { email: user.email },
      {
        ...(updatesubcriberDto.skills !== undefined && { skills: updatesubcriberDto.skills }),
        email: user.email,
        name: user.name,
        $setOnInsert: {
          createdBy: { _id: user._id, email: user.email },
        },
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { upsert: true, runValidators: true }
    )
    return updated
  }

  async getSkills(user: IUser) {
    const { email } = user
    return await this.subcriberModel.findOne({ email }, { skills: 1 })
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`)
    }
    await this.subcriberModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return await this.subcriberModel.softDelete({ _id })
  }
}
