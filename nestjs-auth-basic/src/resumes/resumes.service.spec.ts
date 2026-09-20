/// <reference types="jest" />
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { IUser } from '../users/users.interface';
import { IS_PUBLIC_KEY } from '../decorator/customize';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('Resume company access', () => {
  const companyId = '111111111111111111111111';
  const id = '222222222222222222222222';
  const hr: IUser = { _id: id, name: 'HR', email: 'hr@example.com',
    role: { _id: id, name: 'HR' }, company: { _id: companyId } };
  let model: any;
  let service: ResumesService;

  beforeEach(() => {
    const query: any = {};
    for (const method of ['skip', 'limit', 'sort', 'select', 'populate']) query[method] = jest.fn(() => query);
    query.exec = jest.fn().mockResolvedValue([]);
    model = {
      find: jest.fn(() => query), countDocuments: jest.fn().mockResolvedValue(0),
      findOne: jest.fn().mockResolvedValue(null),
      updateOne: jest.fn().mockResolvedValue({ matchedCount: 0, modifiedCount: 0 }),
    };
    service = new ResumesService(model);
  });

  it('requires authentication for both read routes', () => {
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ResumesController.prototype.findAll)).toBeUndefined();
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ResumesController.prototype.findOne)).toBeUndefined();
  });

  it('allows authenticated applicants without admin permissions while keeping management protected', () => {
    const guard = new JwtAuthGuard(new Reflector());
    const applicant = { ...hr, role: { _id: id, name: 'NORMAL_USER' }, permissions: [] };
    const context = (handler: Function) => ({
      getHandler: () => handler, getClass: () => ResumesController,
      switchToHttp: () => ({ getRequest: () => ({ method: 'POST', route: { path: '/api/v1/resumes' } }) }),
    } as any);
    const createContext = context(ResumesController.prototype.create);
    expect(Reflect.getMetadata(IS_PUBLIC_KEY, ResumesController.prototype.create)).toBeUndefined();
    expect(guard.handleRequest(null, applicant, null, createContext)).toBe(applicant);
    expect(() => guard.handleRequest(null, null, null, createContext)).toThrow(expect.objectContaining({ status: 401 }));
    for (const handler of [ResumesController.prototype.findAll, ResumesController.prototype.findOne,
      ResumesController.prototype.update, ResumesController.prototype.remove]) {
      expect(() => guard.handleRequest(null, applicant, null, context(handler))).toThrow(expect.objectContaining({ status: 403 }));
    }
  });

  it('intersects client filters with HR company for both rows and totals', async () => {
    await service.findAll(1, 10, 'companyId=333333333333333333333333', hr);
    const filter = model.find.mock.calls[0][0];
    expect(filter.$and[1]).toEqual({ companyId });
    expect(model.countDocuments).toHaveBeenCalledWith(filter);
  });

  it('rejects HR without a company before querying', async () => {
    const unassigned = { ...hr, company: undefined };
    await expect(service.findAll(1, 10, '', unassigned)).rejects.toMatchObject({ status: 403 });
    await expect(service.findOne(id, unassigned)).rejects.toMatchObject({ status: 403 });
    await expect(service.update(id, { status: 'APPROVED' } as any, unassigned)).rejects.toMatchObject({ status: 403 });
    await expect(service.remove(id, unassigned)).rejects.toMatchObject({ status: 403 });
    expect(model.find).not.toHaveBeenCalled();
    expect(model.updateOne).not.toHaveBeenCalled();
  });

  it('returns 404 for out-of-company detail, update and delete', async () => {
    await expect(service.findOne(id, hr)).rejects.toMatchObject({ status: 404 });
    await expect(service.update(id, { status: 'APPROVED' } as any, hr)).rejects.toMatchObject({ status: 404 });
    await expect(service.remove(id, hr)).rejects.toMatchObject({ status: 404 });
    expect(model.findOne).toHaveBeenCalledWith({ _id: id, companyId });
    for (const [filter] of model.updateOne.mock.calls) expect(filter).toMatchObject({ _id: id, companyId });
  });

  it('allows matching-company CVs and deletes atomically within company scope', async () => {
    model.findOne.mockResolvedValue({ _id: id, companyId });
    model.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
    await expect(service.findOne(id, hr)).resolves.toMatchObject({ companyId });
    await expect(service.update(id, { status: 'APPROVED' } as any, hr)).resolves.toMatchObject({ matchedCount: 1 });
    await expect(service.remove(id, hr)).resolves.toEqual({ deleted: 1 });
    expect(model.updateOne.mock.calls[1][1]).toMatchObject({ isDeleted: true });
  });

  it('keeps administrators unrestricted by company', async () => {
    await service.findAll(1, 10, '', { ...hr, role: { _id: id, name: 'SUPER_ADMIN' } });
    expect(model.find.mock.calls[0][0].$and[1]).toEqual({});
  });
});
