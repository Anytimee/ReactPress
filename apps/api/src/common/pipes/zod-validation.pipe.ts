import { Injectable, type PipeTransform } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import type { ZodType } from 'zod';
import { apiError } from '../api-error.js';

/**
 * Pipe validasi berbasis Zod. Dipakai per-endpoint:
 *   @Body(new ZodValidationPipe(createUserSchema)) body: CreateUserDto
 */
@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw apiError('Validasi payload gagal', HttpStatus.BAD_REQUEST, result.error.flatten());
    }
    return result.data;
  }
}
