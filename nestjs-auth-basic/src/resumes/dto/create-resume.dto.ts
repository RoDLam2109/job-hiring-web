import { Transform, Type } from 'class-transformer';
import { ArrayNotEmpty, IsDateString, IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator'
import mongoose from 'mongoose'

export class CreateResumeDto {
    @IsNotEmpty({ message: 'email không được để trống' })
    email: string;

    @IsNotEmpty({ message: 'status không được để trống' })
    status: string;

    @IsNotEmpty({ message: 'url không được để trống' })
    url: string

    @IsNotEmpty({ message: 'userId không được để trống' })
    userId: string

    @IsNotEmpty({ message: 'jobId không được để trống' })
    jobId: string

    @IsNotEmpty({ message: 'companyId không được để trống' })
    companyId: string

}

export class CreateUserCvDto {
    @IsNotEmpty({ message: 'url không được để trống' })
    url: string

    @IsNotEmpty({ message: 'companyId không được để trống' })
    companyId: string

    @IsNotEmpty({ message: 'jobId không được để trống' })
    jobId: string

}
