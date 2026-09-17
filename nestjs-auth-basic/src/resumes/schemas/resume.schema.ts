import { Company } from "@/companies/schemas/company.schemas";
import { Job } from "@/jobs/schemas/job.schema";
import { User } from '@/users/schemas/user.schema'; // đúngimport { Job } from "@/jobs/schemas/job.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type ResumeDocument = HydratedDocument<Resume>

@Schema({ timestamps: true })
export class Resume {
    @Prop()
    email: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
    userId: mongoose.Schema.Types.ObjectId;

    @Prop()
    url: string;

    @Prop()
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
    companyId: mongoose.Schema.Types.ObjectId;
    // nen doi ten bien thanh company


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name })
    jobId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.Array })
    history: {
        status: string;
        updatedAt: Date;
        updatedBy: {
            email: string;
            _id: mongoose.Types.ObjectId;
        }
    }[];

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Types.ObjectId;
        email: string;
    }

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop()
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;

}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
