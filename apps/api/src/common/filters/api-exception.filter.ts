import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ErrorBody {
  error: string;
  details?: unknown;
}

/** Format semua error jadi { error, details? } agar konsisten di frontend. */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorBody = { error: 'Terjadi kesalahan pada server' };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        body = { error: payload };
      } else if (payload && typeof payload === 'object') {
        const record = payload as Record<string, unknown>;
        if (typeof record.error === 'string') {
          body = { error: record.error };
          if (record.details !== undefined) {
            body.details = record.details;
          }
        } else if (typeof record.message === 'string') {
          body = { error: record.message };
        } else if (Array.isArray(record.message)) {
          body = { error: 'Validasi payload gagal', details: record.message };
        }
      }
    } else if (exception instanceof Error) {
      body = { error: exception.message };
      this.logger.error(exception.message, exception.stack);
    }

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(`${request.method} ${request.url} -> ${status} ${body.error}`);
    }

    response.status(status).json(body);
  }
}
