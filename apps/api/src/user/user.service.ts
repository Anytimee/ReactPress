import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import type { Paginated, User } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { hashPassword } from '../common/utils/password.js';
import { User as UserEntity } from './user.entity.js';
import type { CreateUserInput, ListUsersInput, UpdateUserInput } from './dto/user.dto.js';

const ADMIN_ROLES = ['admin', 'super_admin'] as const;

@Injectable()
export class UserService {
  constructor(@InjectRepository(UserEntity) private readonly users: Repository<UserEntity>) {}

  private toDto(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  async list(query: ListUsersInput): Promise<Paginated<User>> {
    const [rows, total] = await this.users.findAndCount({
      where: query.q ? { email: ILike(`%${query.q}%`) } : {},
      order: { createdAt: 'DESC' },
      skip: (query.page - 1) * query.perPage,
      take: query.perPage,
    });

    return {
      data: rows.map((row) => this.toDto(row)),
      total,
      page: query.page,
      perPage: query.perPage,
    };
  }

  async findById(id: string): Promise<UserEntity> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw apiError('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async create(input: CreateUserInput): Promise<User> {
    const email = input.email.toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw apiError('Email sudah digunakan', HttpStatus.CONFLICT);
    }

    const entity = this.users.create({
      email,
      name: input.name,
      role: input.role,
      password: await hashPassword(input.password),
    });

    const saved = await this.users.save(entity);
    return this.toDto(saved);
  }

  async update(id: string, input: UpdateUserInput, actorId: string): Promise<User> {
    const user = await this.findById(id);

    if (input.email) {
      const email = input.email.toLowerCase();
      const existing = await this.users.findOne({ where: { email } });
      if (existing && existing.id !== id) {
        throw apiError('Email sudah digunakan', HttpStatus.CONFLICT);
      }
      user.email = email;
    }

    if (input.name) user.name = input.name;

    if (input.role && input.role !== user.role) {
      if (user.id === actorId) {
        throw apiError('Tidak bisa mengubah role akun sendiri', HttpStatus.BAD_REQUEST);
      }
      await this.assertNotLastAdmin(user, input.role);
      user.role = input.role;
    }

    if (input.password) {
      user.password = await hashPassword(input.password);
    }

    const saved = await this.users.save(user);
    return this.toDto(saved);
  }

  async remove(id: string, actorId: string): Promise<void> {
    if (id === actorId) {
      throw apiError('Tidak bisa menghapus akun sendiri', HttpStatus.BAD_REQUEST);
    }

    const user = await this.findById(id);
    await this.assertNotLastAdmin(user, null);

    await this.users.remove(user);
  }

  /** Jangan sampai tidak ada admin/super_admin yang tersisa. */
  private async assertNotLastAdmin(user: UserEntity, nextRole: string | null): Promise<void> {
    const isAdmin = (ADMIN_ROLES as readonly string[]).includes(user.role);
    if (!isAdmin) return;
    if (nextRole !== null && (ADMIN_ROLES as readonly string[]).includes(nextRole)) return;

    const admins = await this.users.find({
      where: ADMIN_ROLES.map((role) => ({ role })),
    });
    const remaining = admins.filter((admin) => admin.id !== user.id);

    if (remaining.length === 0) {
      throw apiError(
        'Tidak bisa menghapus atau menurunkan role admin terakhir',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
