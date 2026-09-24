/// <reference types="jest" />
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { PassportModule, PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Writable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import request from 'supertest';
import { FilesModule } from './files.module';
import { TransformInterceptor } from '../core/transform.interceptor';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class TestJwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: 'upload-test-only' });
  }
  validate(payload: any) { return payload; }
}

describe('Cloudinary company logo uploads', () => {
  let app: NestExpressApplication;
  let sdk: jest.SpyInstance;
  let config: Record<string, string>;
  let uploadedBytes: Buffer;
  const url = 'https://res.cloudinary.com/test/image/upload/workly/company/logo.png';
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64');
  const token = new JwtService({ secret: 'upload-test-only' }).sign({
    _id: 'test-admin', role: { name: 'SUPER_ADMIN' },
  });

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [FilesModule, PassportModule], providers: [TestJwtStrategy],
    })
      .overrideProvider(ConfigService)
      .useValue({ get: (key: string) => config[key] }).compile();
    app = module.createNestApplication<NestExpressApplication>();
    app.setGlobalPrefix('api/v1');
    app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();
  });
  beforeEach(() => {
    config = { CLOUDINARY_CLOUD_NAME: 'test', CLOUDINARY_API_KEY: 'test-key', CLOUDINARY_API_SECRET: 'test-secret' };
    sdk = jest.spyOn(cloudinary.uploader, 'upload_stream');
    sdk.mockImplementation((options: any, callback: any): any => {
      const chunks: Buffer[] = [];
      return new Writable({
        write(chunk, encoding, done) { chunks.push(Buffer.from(chunk)); done(); },
        final(done) {
          uploadedBytes = Buffer.concat(chunks);
          callback(undefined, { secure_url: url });
          done();
        },
      });
    });
  });
  afterEach(() => jest.restoreAllMocks());
  afterAll(async () => { await app.close(); });

  const upload = (bytes = png, contentType = 'image/png') => request(app.getHttpServer())
    .post('/api/v1/files/upload').auth(token, { type: 'bearer' }).set('folder_type', 'company')
    .attach('fileUpload', bytes, { filename: 'logo.png', contentType });

  it('returns the Cloudinary URL in the existing fileName contract and streams the image bytes', async () => {
    const response = await upload().expect(201);
    expect(response.body.data).toEqual({ fileName: url });
    expect(uploadedBytes).toEqual(png);
    expect(sdk).toHaveBeenCalledWith(expect.objectContaining({
      folder: 'workly/company', resource_type: 'image', api_secret: 'test-secret',
    }), expect.any(Function));
  });
  it('rejects unauthenticated uploads before contacting Cloudinary', async () => {
    await request(app.getHttpServer()).post('/api/v1/files/upload')
      .set('folder_type', 'company').attach('fileUpload', png, 'logo.png').expect(401);
    expect(sdk).not.toHaveBeenCalled();
  });
  it('reports missing configuration instead of silently saving on ephemeral disk', async () => {
    delete config.CLOUDINARY_API_SECRET;
    const response = await upload().expect(503);
    expect(response.body.message).toContain('Cloudinary');
    expect(sdk).not.toHaveBeenCalled();
  });
  it('returns a safe error when Cloudinary fails', async () => {
    sdk.mockImplementation((options: any, callback: any): any => new Writable({
      write(chunk, encoding, done) { done(); },
      final(done) { callback(new Error('secret provider details')); done(); },
    }));
    const response = await upload().expect(502);
    expect(JSON.stringify(response.body)).not.toContain('secret provider details');
  });
  it('handles a stream error', async () => {
    sdk.mockImplementation((): any => new Writable({
      write(chunk, encoding, done) { done(new Error('network failure')); },
    }));
    await upload().expect(502);
  });
  it('rejects documents before contacting Cloudinary', async () => {
    await upload(Buffer.from('document'), 'application/pdf').expect(422);
    expect(sdk).not.toHaveBeenCalled();
  });
  it('rejects oversized logos before contacting Cloudinary', async () => {
    await upload(Buffer.alloc(2 * 1024 * 1024)).expect(413);
    expect(sdk).not.toHaveBeenCalled();
  });
  it('rejects an empty upload', async () => {
    await request(app.getHttpServer()).post('/api/v1/files/upload')
      .auth(token, { type: 'bearer' }).set('folder_type', 'company').expect(422);
    expect(sdk).not.toHaveBeenCalled();
  });
});
