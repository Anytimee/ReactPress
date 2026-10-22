import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { User } from '@reactpress/types';
import { UserService } from './user.service.js';
import {
  createUserSchema,
  listUsersSchema,
  updateUserSchema,
  type CreateUserInput,
  type ListUsersInput,
  type UpdateUserInput,
} from './dto/user.dto.js';

@Controller('users')
@Roles('admin', 'super_admin')
export class UserController {
  constructor(private readonly users: UserService) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listUsersSchema)) query: ListUsersInput) {
    return this.users.list(query);
  }

  @Post()
  async create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserInput) {
    return this.users.create(body);
  }

  @Get(':id')
  async get(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.users.findById(id);
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) body: UpdateUserInput,
    @CurrentUser() actor: User,
  ) {
    return this.users.update(id, body, actor.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: User) {
    await this.users.remove(id, actor.id);
  }
}
