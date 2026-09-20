/// <reference types="jest" />
import { JobsService } from './jobs.service';
import { IUser } from '../users/users.interface';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';

describe('HR job company scope', () => {
  const id = '111111111111111111111111';
  const companyId = '222222222222222222222222';
  const hr: IUser = { _id: id, name: 'HR', email: 'hr@example.com', role: { _id: id, name: 'HR' }, company: { _id: companyId } };
  let model: any;
  let service: JobsService;
  beforeEach(() => {
    const query: any = {};
    for (const method of ['skip', 'limit', 'sort', 'populate']) query[method] = () => query;
    query.exec = async () => [];
    model = { find: jest.fn(() => query), countDocuments: jest.fn().mockResolvedValue(0),
      findOne: jest.fn().mockResolvedValue(null), updateOne: jest.fn().mockResolvedValue({ matchedCount: 0 }), create: jest.fn() };
    service = new JobsService(model);
  });
  it('filters rows and totals by the authenticated HR company despite client filters', async () => {
    await service.findAll(1, 10, 'company._id=333333333333333333333333', hr);
    const filter = model.find.mock.calls[0][0];
    expect(filter.$and[1]['company._id'].$in.map(String)).toEqual([companyId, companyId]);
    expect(model.countDocuments).toHaveBeenCalledWith(filter);
  });
  it('scopes detail, update and delete and rejects nonmatching records', async () => {
    await expect(service.findOne(id, hr)).rejects.toMatchObject({ status: 404 });
    await expect(service.update(id, {} as any, hr)).rejects.toMatchObject({ status: 404 });
    await expect(service.remove(id, hr)).rejects.toMatchObject({ status: 404 });
    for (const [filter] of [...model.findOne.mock.calls, ...model.updateOne.mock.calls]) {
      expect(filter['company._id'].$in.map(String)).toEqual([companyId, companyId]);
    }
  });
  it('blocks HR without company and company reassignment', async () => {
    await expect(service.findAll(1, 10, '', { ...hr, company: undefined })).rejects.toMatchObject({ status: 403 });
    await expect(service.create({ company: { _id: id } } as any, hr)).rejects.toMatchObject({ status: 403 });
    await expect(service.update(id, { company: { _id: id } } as any, hr)).rejects.toMatchObject({ status: 403 });
    await expect(service.update(id, { company: null } as any, hr)).rejects.toMatchObject({ status: 403 });
    expect(model.updateOne).not.toHaveBeenCalled();
  });
  it('preserves public and administrator job browsing', async () => {
    for (const user of [undefined, { ...hr, role: { _id: id, name: 'SUPER_ADMIN' } }]) {
      await service.findAll(1, 10, '', user);
    }
    for (const [filter] of model.find.mock.calls) expect(filter.$and[1]).toEqual({});
    const guard = new OptionalJwtAuthGuard();
    expect(guard.canActivate({ switchToHttp: () => ({ getRequest: () => ({ headers: {} }) }) } as any)).toBe(true);
  });
});
