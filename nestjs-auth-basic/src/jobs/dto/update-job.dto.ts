import { CreateJobDto } from './create-Job.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateJobDto extends PartialType(CreateJobDto) {
}
