import { IsArray, IsEmail, isNotEmpty, IsNotEmpty, IsString } from "class-validator";

export class CreateSubcriberDto {
    @IsEmail({}, { message: 'Email không đúng định dạng !!!' })
    @IsNotEmpty({ message: 'Email không được để trống !!!' })
    email: string;

    @IsNotEmpty({ message: 'Name không được để trống !!!' })
    name: string;

    @IsArray({ message: 'Skill phải có định dạng là array !!!' })
    @IsString({ each: true, message: 'Skill phải có định dạng là stringg !!!' })
    @IsNotEmpty({ message: 'Skill không được để trống !!!' })
    skills: string[];

}
