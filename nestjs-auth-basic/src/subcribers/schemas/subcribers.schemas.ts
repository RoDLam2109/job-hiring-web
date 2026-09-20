import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose, { HydratedDocument } from "mongoose"

export type SubcriberDocument = HydratedDocument<Subcriber>

@Schema({ timestamps: true })
export class Subcriber {
    @Prop({ require: true })
    email: string

    @Prop()
    name: string

    @Prop()
    skills: string[]

    @Prop({ type: Object })
    createdBy: {
        email: string;
        _id: mongoose.Schema.Types.ObjectId;

    }
}
export const SubcriberSchema = SchemaFactory.createForClass(Subcriber);
