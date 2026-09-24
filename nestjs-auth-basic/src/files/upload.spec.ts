/// <reference types="jest" />
import { Test } from '@nestjs/testing';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { FilesModule } from './files.module';
import { getUploadDirectory, PUBLIC_DIRECTORY } from './upload-path';
import { TransformInterceptor } from '../core/transform.interceptor';

describe.each(['local', 'persistent'])('Upload storage and public URL (%s)', (mode) => {
  let app: NestExpressApplication;
  let uploadRoot: string;
  let diskDirectory: string;
  const previousDirectory = process.env.UPLOAD_DIRECTORY;
  const folder = `upload-test-${Date.now()}`;
  let uploadedPath: string;
  const startApp = async () => {
    const module = await Test.createTestingModule({ imports: [FilesModule] }).compile();
    app = module.createNestApplication<NestExpressApplication>();
    app.setGlobalPrefix('api/v1');
    app.useStaticAssets(getUploadDirectory(), { prefix: '/images/' });
    app.useStaticAssets(PUBLIC_DIRECTORY);
    app.useGlobalInterceptors(new TransformInterceptor(app.get(Reflector)));
    await app.init();
  };
  beforeAll(async () => {
    if (mode === 'persistent') {
      diskDirectory = await fs.mkdtemp(join(tmpdir(), 'workly-uploads-'));
      process.env.UPLOAD_DIRECTORY = diskDirectory;
    } else {
      delete process.env.UPLOAD_DIRECTORY;
    }
    uploadRoot = getUploadDirectory();
    await startApp();
  });
  afterAll(async () => {
    await app.close();
    if (uploadedPath) await fs.unlink(uploadedPath);
    await fs.rmdir(join(uploadRoot, folder)).catch(() => undefined);
    if (diskDirectory) await fs.rmdir(diskDirectory);
    if (previousDirectory === undefined) delete process.env.UPLOAD_DIRECTORY;
    else process.env.UPLOAD_DIRECTORY = previousDirectory;
  });
  it('creates a new folder, persists bytes and serves the returned filename', async () => {
    const bytes = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=', 'base64');
    const response = await request(app.getHttpServer())
      .post('/api/v1/files/upload').set('folder_type', folder)
      .attach('fileUpload', bytes, { filename: 'logo.png', contentType: 'image/png' })
      .expect(201);
    expect(response.body.data.fileName).toMatch(/^logo-\d+\.png$/);
    uploadedPath = join(uploadRoot, folder, response.body.data.fileName);
    expect(await fs.readFile(uploadedPath)).toEqual(bytes);
    const image = await request(app.getHttpServer())
      .get(`/images/${folder}/${response.body.data.fileName}`).expect(200);
    expect(image.body).toEqual(bytes);
    await app.close();
    await startApp();
    const afterRestart = await request(app.getHttpServer())
      .get(`/images/${folder}/${response.body.data.fileName}`).expect(200);
    expect(afterRestart.body).toEqual(bytes);
  });
  it('still serves images bundled with the source', async () => {
    const bundled = await fs.readFile(join(PUBLIC_DIRECTORY, 'images', 'company', 'fb.png'));
    const response = await request(app.getHttpServer())
      .get('/images/company/fb.png').expect(200);
    expect(response.body).toEqual(bundled);
  });
  it('rejects a folder outside the image directory', async () => {
    await request(app.getHttpServer()).post('/api/v1/files/upload')
      .set('folder_type', '../outside').attach('fileUpload', Buffer.from('test'), 'test.png')
      .expect(400);
  });
});
