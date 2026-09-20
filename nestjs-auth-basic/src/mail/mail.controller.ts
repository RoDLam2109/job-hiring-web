import { Controller, Get, Inject } from '@nestjs/common';
import { MailService } from './mail.service';
import { Public, ResponseMessage } from '@/decorator/customize';
import { MailerService } from '@nestjs-modules/mailer';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subcriber, SubcriberDocument } from '@/subcribers/schemas/subcribers.schemas';
import { Job, JobDocument } from '@/jobs/schemas/job.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailerService: MailerService,
    @InjectModel(Subcriber.name)
    private subscriberModel: SoftDeleteModel<SubcriberDocument>,
    @InjectModel(Job.name)
    private jobModel: SoftDeleteModel<JobDocument>,
  ) { }

  @Get()
  @Public()
  @ResponseMessage("Test email")
  @Cron("0 0 0 * * 0")//0h00 AM every sunday
  async handleTestEmail() {

    const subscribers = await this.subscriberModel.find({});

    for (const subs of subscribers) {

      const subsSkills = subs.skills;

      const jobWithMatchingSkills = await this.jobModel.find({
        skills: { $in: subsSkills }
      });

      if (jobWithMatchingSkills?.length) {

        const jobs = jobWithMatchingSkills.map(item => {
          return {
            name: item.name,
            company: item.company?.name ?? 'Không xác định',
            salary: `${item.salary ?? 0}`
              .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
            skills: item.skills,
          }
        });

        await this.mailerService.sendMail({
          to: subs.email,
          from: '"Support Team" <support@example.com>',
          subject: 'Việc làm phù hợp với kỹ năng của bạn',
          template: "job",
          context: {
            receiver: subs.name,
            jobs: jobs
          }
        });
      }
    }
  }
}
