import { Injectable } from "@nestjs/common";
import { MulterModuleOptions, MulterOptionsFactory } from "@nestjs/platform-express";
import fs from 'fs'
import { diskStorage } from "multer";
import path, { join } from "path";
@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  getRootPath = () => { // trả ra đường link thư mục root
    return process.cwd();
  };

  ensureExists(targetDirectory: string) {// nếu thư mục chưa tồn tại, tạo mới thư mục
    fs.mkdir(targetDirectory, { recursive: true }, (error) => {
      if (!error) {
        console.log('Directory successfully created, or it already exists.');
        return;
      }

      switch (error.code) {
        case 'EEXIST':
          // Error:
          // Requested location already exists, but it's not a directory.
          break;

        case 'ENOTDIR':
          // Error:
          // The parent hierarchy contains a file with the same name as the directory
          // you're trying to create.
          break;

        default:
          // Some other error, like permission denied.
          console.error(error);
          break;
      }
    });
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = req?.headers?.folder_type ?? 'default';
          const uploadDirectory = join(
            this.getRootPath(),
            'src',
            'public',
            'images',
            folder as string,
          );

          this.ensureExists(uploadDirectory);

          cb(null, uploadDirectory);
        },

        filename: (req, file, cb) => {
          // Get image extension
          const extName = path.extname(file.originalname);

          // Get image's name (without extension)
          const baseName = path.basename(file.originalname, extName);

          const finalName = `${baseName}-${Date.now()}${extName}`;

          cb(null, finalName);
        },
      }),
    };
  }
}
