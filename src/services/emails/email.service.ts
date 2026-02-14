import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { emailSenderConfig, emailTemplateBuilder } from './config';
import { UserService } from '../../modules/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  sendWelcomeEmail(email: string, name: string) {
    const mailOptions = emailTemplateBuilder(
      'welcome.hbs',
      email,
      'Welcome to Badge',
      { name },
    );
    return emailSenderConfig(mailOptions);
  }

  async sendVerificationEmail(
    email: string,
    data: { otp: string; name: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'otp.hbs',
      email,
      `Badge OTP - ${data.otp} is your verification code`,
      data,
    );
    return emailSenderConfig(mailOptions);
  }
}
