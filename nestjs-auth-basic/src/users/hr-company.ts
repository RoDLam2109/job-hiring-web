import { ForbiddenException } from '@nestjs/common';
import mongoose from 'mongoose';
import { IUser } from './users.interface';

export function getHrCompanyId(user?: IUser): string | undefined {
  if (user?.role?.name !== 'HR') return undefined;
  const companyId = user.company?._id;
  if (!companyId || !mongoose.isObjectIdOrHexString(companyId)) {
    throw new ForbiddenException('Tài khoản HR chưa được gán công ty hợp lệ');
  }
  return String(companyId);
}
