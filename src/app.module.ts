import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/* CONFIG */
import { ConfigModule } from '@nestjs/config';

/* AUTHGUARDS */
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/middleware/jwt-auth-guard.middleware';
import { RolesGuard } from './common/middleware/role-base-guard.middleware';

/* MODULES */
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CompanyModule } from './modules/company/company.module';
import { JobModule } from './modules/jobs/job.module';
import { PaymentModule } from './modules/payment/payment.module';
import { UtilsModule } from './modules/utils/utils.module';

/* SERVICES */
import { EmailModule } from './services/emails/email.module';
import { FileManagerModule } from './services/file-manager/file-manager.module';
import { DatabaseModule } from './services/database/database.module';
import { JsonWebTokenModule } from './services/json-web-token/json-web-token.module';
import { RecruiterModule } from './modules/recruiter/recruiter.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ global: true }),
    DatabaseModule,
    JsonWebTokenModule,
    AuthModule,
    UserModule,
    PaymentModule,
    CompanyModule,
    FileManagerModule,
    JobModule,
    EmailModule,
    UtilsModule,
    RecruiterModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
