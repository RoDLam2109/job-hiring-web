import { BadGatewayException, Injectable, ServiceUnavailableException, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { UploadApiOptions } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor(private readonly config: ConfigService) {}

  async uploadCompanyLogo(buffer: Buffer): Promise<string> {
    return this.upload(buffer, {
      folder: 'workly/company', resource_type: 'image', allowed_formats: ['jpg', 'png'],
    });
  }

  async uploadResume(buffer: Buffer, originalName: string): Promise<string> {
    const extension = extname(originalName).toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
      throw new UnprocessableEntityException('CV phải là file PDF, DOC hoặc DOCX.');
    }
    return this.upload(buffer, {
      folder: 'workly/resume', resource_type: 'raw',
      public_id: `${randomUUID()}${extension}`,
    });
  }

  private async upload(buffer: Buffer, options: UploadApiOptions): Promise<string> {
    const cloud_name = this.config.get<string>('CLOUDINARY_CLOUD_NAME');
    const api_key = this.config.get<string>('CLOUDINARY_API_KEY');
    const api_secret = this.config.get<string>('CLOUDINARY_API_SECRET');
    if (!cloud_name || !api_key || !api_secret) {
      throw new ServiceUnavailableException('Chưa cấu hình Cloudinary trên backend.');
    }
    try {
      return await new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          cloud_name, api_key, api_secret,
          ...options, timeout: 60000,
        }, (error, result) => {
          if (error || !result?.secure_url) reject(error || new Error('Missing uploaded image URL'));
          else resolve(result.secure_url);
        });
        stream.on('error', reject);
        stream.end(buffer);
      });
    } catch {
      // SDK errors may contain account/request details; return a safe message.
      throw new BadGatewayException('Không thể lưu file lên Cloudinary. Vui lòng thử lại.');
    }
  }
}
