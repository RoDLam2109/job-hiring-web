import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from './schemas/job.schema';
import { Company, CompanySchema } from '../companies/schemas/company.schemas';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Job.name, schema: JobSchema },
    { name: Company.name, schema: CompanySchema },
  ])],
  controllers: [JobsController],
  providers: [JobsService]
})
export class JobsModule {}
