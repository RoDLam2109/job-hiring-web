import { IsString, Matches, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePhoneDto {
  @ValidateIf((_, value) => value !== undefined)
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @MinLength(1, { message: 'Họ và tên không được để trống' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự' })
  name?: string;

  @IsString()
  @Matches(/^(0\d{9}|\+84\d{9})$/, { message: 'Số điện thoại phải có dạng 0xxxxxxxxx hoặc +84xxxxxxxxx' })
  phone: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1)
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  @MaxLength(72)
  newPassword: string;
}
