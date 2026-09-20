import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcriberDto } from './create-subcribers.dto';

export class UpdateSubcriberDto extends PartialType(CreateSubcriberDto) {}
