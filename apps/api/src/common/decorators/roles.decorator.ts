import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@reactpress/types';

export const ROLES_KEY = 'roles';

/**
 * Batasi akses endpoint ke role tertentu.
 * `super_admin` selalu punya akses penuh apa pun daftar role.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
