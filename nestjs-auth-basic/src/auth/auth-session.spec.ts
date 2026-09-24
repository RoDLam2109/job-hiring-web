/// <reference types="jest" />
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

describe('Refresh session cookies', () => {
  let service: AuthService;
  let users: any;
  let jwt: any;
  let response: any;
  let env: Record<string, string>;
  const user = { _id: 'user-id', name: 'Admin', email: 'admin@example.test', role: { _id: 'role-id', name: 'SUPER_ADMIN' } };
  beforeEach(() => {
    env = { RENDER: 'true', JWT_REFRESH_EXPIRE: '7d', JWT_REFRESH_TOKEN_SECRET: 'test-secret' };
    users = { updateUserToken: jest.fn(), findUserByToken: jest.fn().mockResolvedValue(user) };
    jwt = { sign: jest.fn().mockReturnValue('new-token'), verify: jest.fn() };
    response = { cookie: jest.fn(), clearCookie: jest.fn() };
    service = new AuthService(users, jwt, { get: key => env[key] } as ConfigService,
      { findOne: jest.fn().mockResolvedValue({ permissions: [] }) } as any, {} as any);
  });
  it('sets a cross-site HTTPS cookie at login and refresh and clears with matching attributes at logout', async () => {
    await service.login(user, response);
    await service.processNewToken('old-token', response);
    expect(response.cookie).toHaveBeenCalledTimes(2);
    for (const call of response.cookie.mock.calls) {
      expect(call).toEqual(['refresh_token', 'new-token', {
        httpOnly: true, secure: true, sameSite: 'none', path: '/', maxAge: 604800000,
      }]);
    }
    await service.logoutUser(response, user);
    expect(response.clearCookie).toHaveBeenCalledWith('refresh_token', {
      httpOnly: true, secure: true, sameSite: 'none', path: '/',
    });
  });
  it('uses the same cross-site configuration for production outside Render', async () => {
    delete env.RENDER;
    env.NODE_ENV = 'production';
    await service.login(user, response);
    expect(response.cookie.mock.calls[0][2]).toMatchObject({ secure: true, sameSite: 'none' });
  });
  it('supports local HTTP development', async () => {
    delete env.RENDER;
    await service.login(user, response);
    expect(response.cookie.mock.calls[0][2]).toMatchObject({ secure: false, sameSite: 'lax' });
  });
  it('clears an expired refresh cookie and rejects the session', async () => {
    jwt.verify.mockImplementation(() => { throw Object.assign(new Error('Expired'), { name: 'TokenExpiredError' }); });
    await expect(service.processNewToken('expired', response)).rejects.toMatchObject({ status: 400 });
    expect(response.clearCookie).toHaveBeenCalledTimes(1);
    expect(users.findUserByToken).not.toHaveBeenCalled();
  });
  it('does not misreport a database outage as an invalid refresh token', async () => {
    const outage = new Error('Database unavailable');
    users.findUserByToken.mockRejectedValue(outage);
    await expect(service.processNewToken('valid', response)).rejects.toBe(outage);
    expect(response.clearCookie).not.toHaveBeenCalled();
  });
});
