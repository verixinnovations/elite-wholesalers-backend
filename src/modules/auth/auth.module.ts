import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { UserModule } from 'src/modules/user/user.module';
import { LocalStrategy } from './utils/local.strategy';
import { JwtStrategy } from './utils/jwt.stategy';
import { EmailModule } from 'src/services/emails/email.module';
import { Verification } from './entities/auth.entity';

@Module({
  imports: [
    UserModule,
    EmailModule,
    TypeOrmModule.forFeature([User, Verification]),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
