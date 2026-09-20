import { Transform } from 'class-transformer';
import { IsMongoId, IsNotEmpty } from 'class-validator';

// Accept MongoDB Extended JSON IDs from imported job data.
const normalizeMongoId = ({ value }: { value: unknown }) =>
    value !== null && typeof value === 'object' && '$oid' in value
        ? (value as { $oid: unknown }).$oid
        : value;

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

    @Transform(normalizeMongoId, { toClassOnly: true })
    @IsMongoId({ message: 'companyId phải là MongoDB ObjectId hợp lệ' })
    @IsNotEmpty({ message: 'companyId không được để trống' })
    companyId: string

    @Transform(normalizeMongoId, { toClassOnly: true })
    @IsMongoId({ message: 'jobId phải là MongoDB ObjectId hợp lệ' })
    @IsNotEmpty({ message: 'jobId không được để trống' })
    jobId: string

}
