import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';

export function refreshCookieOptions(config: ConfigService): CookieOptions {
  const secure = config.get<string>('NODE_ENV') === 'production'
    || config.get<string>('RENDER') === 'true';
  return { httpOnly: true, secure, sameSite: secure ? 'none' : 'lax', path: '/' };
}
