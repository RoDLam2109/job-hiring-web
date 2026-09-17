import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Company, CompanyDocument } from './schemas/company.schemas';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { IUser } from '@/users/users.interface';
import aqp from 'api-query-params'
import { isEmpty } from 'class-validator';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectModel(Company.name)
    private companyModel: SoftDeleteModel<CompanyDocument>
  ) { }

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    const company = await this.companyModel.create({
      ...createCompanyDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return company;
  }

  async findAll(currentPage: number, limitPage: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limitPage);
    let defaultLimit = +limitPage ? +limitPage : 10;

    const totalItems = (await this.companyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);
    let sortBy = sort
    if (isEmpty(sort)) {
      // @ts-ignore: Unreachable code error
      sortBy = "-updatedAt"
    }

    const result = await this.companyModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // ignore a line below @ts-ignore: Unreachable code error
      .sort(sortBy as any)
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

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`id ${id} không hợp lệ`)
    }
    return await this.companyModel.findById(id);
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`id ${id} không hợp lệ`)
    }
    return await this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updatedBy: {
          name: user.name,
          email: user.email
        }
      });
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`id ${id} không hợp lệ`)
    }
    await this.companyModel.updateOne({ _id: id },
      {
        deletedBy: {
          name: user.name,
          email: user.email,
        },
        // isDeleted : true,
        // deletedAt : new Date(),
      }
    )
    return this.companyModel.softDelete({ _id: id })
  }
}
