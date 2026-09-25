/// <reference types="jest" />
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryService } from './cloudinary.service';

describe('Persistent CV uploads', () => {
  const service = new CloudinaryService({ get: () => 'configured' } as unknown as ConfigService);
  afterEach(() => jest.restoreAllMocks());

  it.each(['pdf', 'doc', 'docx'])('stores %s files remotely and returns the delivery URL', async extension => {
    const url = `https://res.cloudinary.com/test/raw/upload/workly/resume/cv.${extension}`;
    const buffer = Buffer.from('test document');
    const end = jest.fn();
    const upload = jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation(((options, callback) => {
      callback(undefined, { secure_url: url });
      return { on: jest.fn(), end };
    }) as any);
    await expect(service.uploadResume(buffer, `CV.${extension}`)).resolves.toBe(url);
    expect(upload).toHaveBeenCalledWith(expect.objectContaining({
      resource_type: 'raw', folder: 'workly/resume',
      public_id: expect.stringMatching(new RegExp(`\\.${extension}$`)),
    }), expect.any(Function));
    expect(end).toHaveBeenCalledWith(buffer);
  });

  it('rejects unsupported documents before upload', async () => {
    const upload = jest.spyOn(cloudinary.uploader, 'upload_stream');
    await expect(service.uploadResume(Buffer.from('x'), 'CV.html')).rejects.toMatchObject({ status: 422 });
    expect(upload).not.toHaveBeenCalled();
  });

  it('reports failed remote storage instead of returning a local filename', async () => {
    jest.spyOn(cloudinary.uploader, 'upload_stream').mockImplementation((() => {
      throw new Error('upload failed');
    }) as any);
    await expect(service.uploadResume(Buffer.from('x'), 'CV.pdf')).rejects.toMatchObject({ status: 502 });
  });
});
