import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { HttpStatus } from '@nestjs/common';
import type { UserRole } from '@reactpress/types';
import { apiError } from '../api-error.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import type { AuthenticatedRequest } from '../decorators/current-user.decorator.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;

    if (!user) {
      throw apiError('Autentikasi diperlukan', HttpStatus.UNAUTHORIZED);
    }

    if (user.role === 'super_admin') {
      return true;
    }

    if (!required.includes(user.role)) {
      throw apiError('Role tidak diizinkan untuk aksi ini', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
