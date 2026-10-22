import { z } from 'zod';
import { USER_ROLES } from '@reactpress/types';

export const createUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8, 'Password minimal 8 karakter').max(200),
  name: z.string().min(1).max(120),
  role: z.enum(USER_ROLES).default('author'),
});

export const updateUserSchema = z.object({
  email: z.string().email().max(255).optional(),
  password: z.string().min(8).max(200).optional(),
  name: z.string().min(1).max(120).optional(),
  role: z.enum(USER_ROLES).optional(),
});

export const listUsersSchema = z.object({
  q: z.string().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ListUsersInput = z.infer<typeof listUsersSchema>;
