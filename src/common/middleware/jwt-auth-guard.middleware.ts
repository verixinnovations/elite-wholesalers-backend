import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<any> {
    const req = context.switchToHttp().getRequest();

    if (req.method === 'OPTIONS') {
      return true;
    }

    return await super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    if (req.method === 'OPTIONS') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic && !user) {
      return null;
    } else if (
      info?.name === 'TokenExpiredError' ||
      info?.name === 'JsonWebTokenError'
    ) {
      throw new ForbiddenException('Invalid token');
    } else if (err || !user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
