import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { Mongoose } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';
import { Subcriber, SubcriberSchema } from './schemas/subcribers.schemas';
@Module({
  imports: [MongooseModule.forFeature([
    { name: Subcriber.name,schema: SubcriberSchema }
  ])],
  controllers: [SubscribersController],
  providers: [SubscribersService]
})
export class SubcribersModule {}
