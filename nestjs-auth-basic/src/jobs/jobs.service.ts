import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from '@/users/users.interface';
import mongoose from 'mongoose';
import { isEmpty } from 'class-validator';
import aqp from 'api-query-params';
import { getHrCompanyId } from '@/users/hr-company';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) {}

  private companyScope(user?: IUser) {
    const companyId = getHrCompanyId(user);
    if (!companyId) return {};
    // company is a Mixed object: existing records may store its ID as a string or ObjectId.
    return { 'company._id': { $in: [companyId, new mongoose.Types.ObjectId(companyId)] } };
  }

  private checkCompany(company: { _id?: unknown } | undefined, user: IUser) {
    const companyId = getHrCompanyId(user);
    if (companyId && company !== undefined && String(company?._id) !== companyId) {
      throw new ForbiddenException('HR chỉ được quản lý việc làm của công ty mình');
    }
  }

  async create(createJobDto: CreateJobDto, user: IUser) {
    this.checkCompany(createJobDto.company, user);
    const { name } = createJobDto;

    const isExist = await this.jobModel.findOne({ name });

    if (isExist) {
      throw new BadRequestException(
        `Name: ${name} đã tồn tại trên hệ thống ! Vui lòng sử dụng tên khác !`,
      );
    }

    const newJob = await this.jobModel.create({
      ...createJobDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    const { _id, createdAt } = newJob;

    return {
      _id,
      createdAt,
    };
  }

  async findAll(
    currentPage: number,
    pageSize: number,
    qs: string,
    user?: IUser,
  ) {
    const { filter, sort, population } = aqp(qs);

    delete filter.current;
    delete filter.pageSize;
    const scopedFilter = { $and: [filter, this.companyScope(user), { isDeleted: { $ne: true } }] };

    const offset = (+currentPage - 1) * (+pageSize);
    const defaultLimit = +pageSize ? +pageSize : 10;

    const totalItems = await this.jobModel.countDocuments(scopedFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    let sortBy = sort;

    if (isEmpty(sort)) {
      // @ts-ignore
      sortBy = '-updatedAt';
    }

    const result = await this.jobModel
      .find(scopedFilter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sortBy as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: pageSize,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(_id: string, user?: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`);
    }

    const job = await this.jobModel.findOne({ _id, ...this.companyScope(user) });
    if (!job) throw new NotFoundException('Không tìm thấy việc làm');
    return job;
  }

  async update(
    _id: string,
    updateJobDto: UpdateJobDto,
    user: IUser,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`);
    }

    this.checkCompany(updateJobDto.company, user);
    const result = await this.jobModel.updateOne(
      { _id, ...this.companyScope(user), isDeleted: { $ne: true } },
      {
        ...updateJobDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    if (!result.matchedCount) throw new NotFoundException('Không tìm thấy việc làm');
    return result;
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException(`id ${_id} không hợp lệ`);
    }

    const result = await this.jobModel.updateOne(
      { _id, ...this.companyScope(user), isDeleted: { $ne: true } },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
        isDeleted: true,
        deletedAt: new Date(),
      },
    );

    if (!result.matchedCount) throw new NotFoundException('Không tìm thấy việc làm');
    return { deleted: result.modifiedCount };
  }
}
