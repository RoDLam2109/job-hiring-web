import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsDateString, IsEmail, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator'
import mongoose from 'mongoose'
class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId

    @IsNotEmpty()
    name: string

    @IsNotEmpty()
    logo: string

}
export class CreateJobDto {
    @IsNotEmpty({ message: 'Name không được để trống' })
    name: string;

    @IsString({ each: true, message: 'Skill phải là 1 chuỗi kí tự' })
    @ArrayNotEmpty({ message: 'Skills không được để trống' })
    skills: string[];

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company

    @IsNotEmpty({ message: 'salary không được để trống' })
    salary: number

    @IsNotEmpty({ message: 'quantity không được để trống' })
    quantity: string

    @IsNotEmpty({ message: 'level không được để trống' })
    level: string;

    @IsNotEmpty({ message: 'description không được để trống' })
    description: string

    @IsNotEmpty({ message: 'location không được để trống' })
    location: string

    @IsNotEmpty({ message: 'startDate không được để trống' })
    startDate: Date

    @IsNotEmpty({ message: 'endDate không được để trống' })
    @IsDateString({}, { message: 'Ngày kết thúc phải ở dạng YYYY-MM-DD' })
    endDate: Date
}
