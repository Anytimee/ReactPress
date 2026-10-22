import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { User } from '@reactpress/types';
import { AuthService, type RequestMeta } from './auth.service.js';
import {
  changePasswordSchema,
  loginSchema,
  type ChangePasswordInput,
  type LoginInput,
} from './dto/auth.dto.js';
import type { AppConfig } from '../config/configuration.js';

const REFRESH_COOKIE = 'refresh_token';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get authConfig(): AppConfig['auth'] {
    return this.config.getOrThrow<AppConfig['auth']>('auth');
  }

  private meta(request: Request): RequestMeta {
    return {
      userAgent: request.get('user-agent')?.slice(0, 500) ?? null,
      ipAddress: request.ip?.slice(0, 64) ?? null,
    };
  }

  private setRefreshCookie(response: Response, token: string): void {
    response.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.authConfig.cookieSecure,
      sameSite: 'lax',
      path: this.authConfig.refreshCookiePath,
      domain: this.authConfig.cookieDomain ?? undefined,
      maxAge: this.authConfig.refreshTtlDays * 24 * 60 * 60 * 1000,
    });
  }

  private clearRefreshCookie(response: Response): void {
    response.clearCookie(REFRESH_COOKIE, {
      httpOnly: true,
      secure: this.authConfig.cookieSecure,
      sameSite: 'lax',
      path: this.authConfig.refreshCookiePath,
      domain: this.authConfig.cookieDomain ?? undefined,
    });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } })
  async login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginInput,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(body.email, body.password, this.meta(request));
    this.setRefreshCookie(response, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 20, ttl: 15 * 60 * 1000 } })
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const raw = request.cookies?.[REFRESH_COOKIE] as string | undefined;
    const result = await this.auth.refresh(raw ?? '', this.meta(request));
    this.setRefreshCookie(response, result.refreshToken);
    return { accessToken: result.accessToken, user: result.user };
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const raw = request.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.logout(raw);
    this.clearRefreshCookie(response);
    return { success: true };
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@CurrentUser() user: User, @Res({ passthrough: true }) response: Response) {
    const revoked = await this.auth.revokeAll(user.id);
    this.clearRefreshCookie(response);
    return { success: true, revoked };
  }

  @Get('me')
  async me(@CurrentUser() user: User) {
    return user;
  }

  @Get('sessions')
  async sessions(@CurrentUser() user: User) {
    return this.auth.listSessions(user.id);
  }

  @Patch('password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(changePasswordSchema)) body: ChangePasswordInput,
    @Req() request: Request,
  ) {
    const raw = request.cookies?.[REFRESH_COOKIE] as string | undefined;
    await this.auth.changePassword(user.id, body.currentPassword, body.newPassword, raw);
    return { success: true };
  }
}
