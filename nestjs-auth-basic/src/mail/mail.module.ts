import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MongooseModule } from '@nestjs/mongoose';
import { Subcriber, SubcriberSchema } from '@/subcribers/schemas/subcribers.schemas';
import { Job, JobSchema } from '@/jobs/schemas/job.schema';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>("EMAIL_HOST"),
          secure: false,
          auth: {
            user: configService.get<string>("EMAIL_AUTH_USER"),
            pass: configService.get<string>("EMAIL_AUTH_PASSWORD"),
          },
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },

        preview: configService.get<string>("EMAIL_PREVIEW") === 'true' ? true : false,
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Subcriber.name, schema: SubcriberSchema },
      { name: Job.name, schema: JobSchema }
    ])],
  controllers: [MailController],
  providers: [MailService]
})
export class MailModule { }
