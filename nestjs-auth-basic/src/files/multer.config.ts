import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express';
import fs from 'fs';
import { diskStorage, memoryStorage, StorageEngine } from 'multer';
import path, { join } from 'path';
import { getUploadDirectory } from './upload-path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    const uploadRoot = getUploadDirectory();
    const disk = diskStorage({
      destination: (req, file, cb) => {
        const folder = req.headers.folder_type ?? 'default';
        if (typeof folder !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(folder)) {
          return cb(new BadRequestException('Invalid upload folder'), '');
        }
        const uploadDirectory = join(uploadRoot, folder);
        // Wait for directory creation before Multer opens the file.
        fs.mkdir(uploadDirectory, { recursive: true }, (error) => {
          cb(error, uploadDirectory);
        });
      },
      filename: (req, file, cb) => {
        const extName = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extName);
        cb(null, `${baseName}-${Date.now()}${extName}`);
      },
    });
    const memory = memoryStorage();
    const selectStorage = (req: any): StorageEngine =>
      req.headers.folder_type === 'company' ? memory : disk;
    return {
      limits: { fileSize: 2 * 1024 * 1024, files: 1 },
      fileFilter: (req, file, cb) => {
        if (req.headers.folder_type === 'company' && !['image/jpeg', 'image/png'].includes(file.mimetype)) {
          return cb(new UnprocessableEntityException('Logo phải là ảnh JPG hoặc PNG.'), false);
        }
        cb(null, true);
      },
      storage: {
        _handleFile: (req, file, cb) => selectStorage(req)._handleFile(req, file, cb),
        _removeFile: (req, file, cb) => selectStorage(req)._removeFile(req, file, cb),
      },
    };
  }
}
