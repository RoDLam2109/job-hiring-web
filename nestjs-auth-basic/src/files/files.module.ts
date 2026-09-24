import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from './multer.config';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryService } from './cloudinary.service';

@Module({
  imports: [ConfigModule, MulterModule.registerAsync({
    useClass: MulterConfigService,
  })],
  controllers: [FilesController],
  providers: [FilesService, CloudinaryService]
})

export class FilesModule { }
