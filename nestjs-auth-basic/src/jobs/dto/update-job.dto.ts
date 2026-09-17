import { CreateJobDto } from './create-job.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateJobDto extends PartialType(CreateJobDto) {
}
