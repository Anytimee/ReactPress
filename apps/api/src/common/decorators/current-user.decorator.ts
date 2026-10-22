import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { User } from '@reactpress/types';
import type { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

/** Ambil user yang sedang login dari request. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): User => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      throw new Error('CurrentUser dipakai pada endpoint yang butuh autentikasi');
    }
    return request.user;
  },
);
