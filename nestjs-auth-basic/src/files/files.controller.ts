import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, Headers, UnprocessableEntityException } from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { SkipPermission, ResponseMessage } from '@/decorator/customize';
import { CloudinaryService } from './cloudinary.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @SkipPermission()
  @Post('upload')
  @ResponseMessage('Upload single file')
  @UseInterceptors(FileInterceptor('fileUpload'))
  async uploadFile(@UploadedFile(
    new ParseFilePipeBuilder()
      .addFileTypeValidator({
        // fileType: /\.(jpg|jpeg|png||txt)$/,
        fileType: /^(image\/(jpeg|png|gif)|text\/plain|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document|application\/octet-stream)$/i,
      })
      .build({
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      }),) file: Express.Multer.File, @Headers('folder_type') folderType: string) {
        const maxSizeMB = folderType === 'company' ? 2 : 1;
        if (file.size >= maxSizeMB * 1024 * 1024) {
          throw new UnprocessableEntityException(`Dung lượng file phải nhỏ hơn ${maxSizeMB} MB`);
        }
        if (folderType === 'company') {
          return { fileName: await this.cloudinaryService.uploadCompanyLogo(file.buffer) };
        }
        if (folderType === 'resume') {
          return { fileName: await this.cloudinaryService.uploadResume(file.buffer, file.originalname) };
        }
        return {
          fileName: file.filename
        }
  }

  @Get()
  findAll() {
    return this.filesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDto: UpdateFileDto) {
    return this.filesService.update(+id, updateFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filesService.remove(+id);
  }
}
