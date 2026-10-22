import { Injectable, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type { User, UserRole } from '@reactpress/types';
import { apiError } from '../common/api-error.js';
import { randomToken, sha256 } from '../common/utils/crypto.js';
import { hashPassword, verifyPassword } from '../common/utils/password.js';
import { User as UserEntity } from '../user/user.entity.js';
import { RefreshToken } from './refresh-token.entity.js';
import type { AppConfig } from '../config/configuration.js';

export interface RequestMeta {
  userAgent: string | null;
  ipAddress: string | null;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    @InjectRepository(RefreshToken) private readonly refreshTokens: Repository<RefreshToken>,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  private get authConfig(): AppConfig['auth'] {
    return this.config.getOrThrow<AppConfig['auth']>('auth');
  }

  private toUser(entity: UserEntity): User {
    return {
      id: entity.id,
      email: entity.email,
      name: entity.name,
      role: entity.role,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }

  private signAccessToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
    return this.jwt.sign(payload, { expiresIn: this.authConfig.accessTtl });
  }

  private async issueRefreshToken(user: UserEntity, meta: RequestMeta): Promise<string> {
    const raw = randomToken(64);
    const expiresAt = new Date(Date.now() + this.authConfig.refreshTtlDays * 24 * 60 * 60 * 1000);

    await this.refreshTokens.save(
      this.refreshTokens.create({
        userId: user.id,
        tokenHash: sha256(raw),
        expiresAt,
        revokedAt: null,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      }),
    );

    return raw;
  }

  async login(email: string, password: string, meta: RequestMeta): Promise<AuthResult> {
    const user = await this.users.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !(await verifyPassword(password, user.password))) {
      throw apiError('Email atau password salah', HttpStatus.UNAUTHORIZED);
    }

    const refreshToken = await this.issueRefreshToken(user, meta);
    return { accessToken: this.signAccessToken(user), refreshToken, user: this.toUser(user) };
  }

  /**
   * Rotasi refresh token.
   * bila token yang dipakai sudah pernah dipakai (revisi), seluruh sesi user dicabut.
   */
  async refresh(rawToken: string, meta: RequestMeta): Promise<AuthResult> {
    const tokenHash = sha256(rawToken);
    const stored = await this.refreshTokens.findOne({ where: { tokenHash } });

    if (!stored) {
      throw apiError('Refresh token tidak valid', HttpStatus.UNAUTHORIZED);
    }

    if (stored.revokedAt) {
      await this.revokeAll(stored.userId);
      throw apiError(
        'Refresh token pernah dipakai ulang — semua sesi dicabut, silakan login kembali',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw apiError('Refresh token kedaluwarsa', HttpStatus.UNAUTHORIZED);
    }

    const user = await this.users.findOne({ where: { id: stored.userId } });
    if (!user) {
      throw apiError('User tidak ditemukan', HttpStatus.UNAUTHORIZED);
    }

    stored.revokedAt = new Date();
    await this.refreshTokens.save(stored);

    const refreshToken = await this.issueRefreshToken(user, meta);
    return { accessToken: this.signAccessToken(user), refreshToken, user: this.toUser(user) };
  }

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const stored = await this.refreshTokens.findOne({ where: { tokenHash: sha256(rawToken) } });
    if (stored && !stored.revokedAt) {
      stored.revokedAt = new Date();
      await this.refreshTokens.save(stored);
    }
  }

  async revokeAll(userId: string, exceptToken?: string): Promise<number> {
    const tokens = await this.refreshTokens.find({ where: { userId, revokedAt: IsNull() } });
    const keepHash = exceptToken ? sha256(exceptToken) : null;
    const now = new Date();

    let revoked = 0;
    for (const token of tokens) {
      if (keepHash && token.tokenHash === keepHash) continue;
      token.revokedAt = now;
      revoked += 1;
    }

    if (revoked > 0) {
      await this.refreshTokens.save(tokens);
    }
    return revoked;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    currentRefreshToken?: string,
  ): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw apiError('User tidak ditemukan', HttpStatus.NOT_FOUND);
    }

    if (!(await verifyPassword(currentPassword, user.password))) {
      throw apiError('Password saat ini salah', HttpStatus.BAD_REQUEST);
    }

    user.password = await hashPassword(newPassword);
    await this.users.save(user);
    await this.revokeAll(userId, currentRefreshToken);
  }

  async findById(userId: string): Promise<User> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }
    return this.toUser(user);
  }

  async listSessions(userId: string) {
    const tokens = await this.refreshTokens.find({
      where: { userId, revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    const now = Date.now();
    return tokens
      .filter((token) => token.expiresAt.getTime() > now)
      .map((token) => ({
        id: token.id,
        userAgent: token.userAgent,
        ipAddress: token.ipAddress,
        createdAt: token.createdAt.toISOString(),
        expiresAt: token.expiresAt.toISOString(),
        revokedAt: null,
        current: false,
      }));
  }
}
