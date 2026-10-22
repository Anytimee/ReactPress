import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { User } from '@reactpress/types';
import { AuthService, type JwtPayload } from './auth.service.js';
import type { AppConfig } from '../config/configuration.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly auth: AuthService,
  ) {
    const authConfig = config.getOrThrow<AppConfig['auth']>('auth');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: authConfig.jwtSecret,
      issuer: authConfig.issuer,
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    return this.auth.findById(payload.sub);
  }
}
