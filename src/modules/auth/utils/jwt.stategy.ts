import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { EnvConfig } from 'src/common/config/env.config';
import { JwtPayload } from 'src/common/interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>(
        EnvConfig.JWT_ACCESS_SECRET,
      ),
    });
  }

  validate(payload: JwtPayload) {
    const requestUser = {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    return requestUser;
  }
}
