import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterError } from 'multer';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import { apiError } from '../common/api-error.js';
import { MediaService } from './media.service.js';
import { listMediaSchema, updateMediaSchema, type ListMediaInput, type UpdateMediaInput } from './dto/media.dto.js';

@Controller('media')
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listMediaSchema)) query: ListMediaInput) {
    return this.media.list(query);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw apiError('File wajib diunggah', HttpStatus.BAD_REQUEST);
    }
    return this.media.upload(file);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const media = await this.media.findById(id);
    return this.media.toDto(media);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateMediaSchema)) body: UpdateMediaInput,
  ) {
    return this.media.update(id, body);
  }

  @Get(':id/usage')
  async usage(@Param('id', ParseUUIDPipe) id: string) {
    return this.media.usage(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Query('force') force?: string) {
    try {
      await this.media.remove(id, force === 'true');
    } catch (error) {
      if (error instanceof MulterError) {
        throw apiError('Ukuran file melebihi batas', HttpStatus.PAYLOAD_TOO_LARGE);
      }
      throw error;
    }
  }
}
