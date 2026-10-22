import { HttpException, HttpStatus } from '@nestjs/common';

export interface ApiErrorBody {
  error: string;
  details?: unknown;
}

/** Semua error API memakai bentuk { error, details? }. */
export function apiError(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST, details?: unknown): HttpException {
  const body: ApiErrorBody = { error: message };
  if (details !== undefined) {
    body.details = details;
  }
  return new HttpException(body, status);
}
