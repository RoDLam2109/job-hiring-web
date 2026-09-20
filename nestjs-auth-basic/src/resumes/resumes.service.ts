import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { getHrCompanyId } from '@/users/hr-company';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from '@/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) { }
  private companyScope(user: IUser) {
    const companyId = getHrCompanyId(user);
    return companyId ? { companyId } : {};
  }
  async create(createResumeDto: CreateUserCvDto, user: IUser) {
    let newResume = await this.resumeModel.create({
      ...createResumeDto,
      email: user.email,
      userId: user._id,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          },
        },
      ],
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    const { _id, createdAt } = newResume
    return { _id, createdAt }
  }

  async findAll(currentPage: number, pageSize: number, qs: string, user: IUser) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    const scopedFilter = { $and: [filter, this.companyScope(user), { isDeleted: { $ne: true } }] };
    let offset = (+currentPage - 1) * (+pageSize);
    let defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = await this.resumeModel.countDocuments(scopedFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let sortBy = sort
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sortBy = "-updatedAt"
    }

    const result = await this.resumeModel.find(scopedFilter)
      .skip(offset)
      .limit(defaultLimit)
      // ignore a line below @ts-ignore: Unreachable code error
      .sort(sortBy as any)
      .select(projection as any)
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

  async findOne(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`)
    }
    const resume = await this.resumeModel.findOne({ _id, ...this.companyScope(user) });
    if (!resume) throw new NotFoundException('Không tìm thấy CV');
    return resume;
  }

  async update(_id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`)
    }
    let updateResume = await this.resumeModel.updateOne(
      { _id, ...this.companyScope(user), isDeleted: { $ne: true } },
      {
        status: updateResumeDto.status,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: updateResumeDto.status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
      }
    )
    if (!updateResume.matchedCount) throw new NotFoundException('Không tìm thấy CV');
    return updateResume;
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`)
    }
    const result = await this.resumeModel.updateOne(
      { _id, ...this.companyScope(user), isDeleted: { $ne: true } },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
        isDeleted: true,
        deletedAt: new Date(),
      }
    )
    if (!result.matchedCount) throw new NotFoundException('Không tìm thấy CV');
    return { deleted: result.modifiedCount };
  }

  async removeOwn(_id: string, user: IUser) {
    if (!mongoose.isObjectIdOrHexString(_id)) {
      throw new BadRequestException('ID CV không hợp lệ');
    }
    const result = await this.resumeModel.updateOne(
      { _id, userId: user._id, isDeleted: { $ne: true } },
      { $set: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: { _id: user._id, email: user.email },
      } },
    );
    if (!result.matchedCount) {
      throw new NotFoundException('Không tìm thấy CV của bạn hoặc CV đã được xóa');
    }
    return { deleted: true };
  }

  async findByUser(user: IUser) {
    return await this.resumeModel.find({
      userId: user._id,
      isDeleted: { $ne: true },
    })
      .sort("-createdAt")
      .populate([
        {
          path: "companyId",
          select: { name: 1 }
        },
        {
          path: "jobId",
          select: { name: 1 }
        }
      ])
  }
}
