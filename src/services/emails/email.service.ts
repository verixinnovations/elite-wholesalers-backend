import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { emailSenderConfig, emailTemplateBuilder } from './config';
import { UserService } from '../../modules/user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { Repository } from 'typeorm';
import { EnvConfig } from '../../common/config/env.config';
import { AccountType } from '../../modules/user/dto/create-user.dto';

@Injectable()
export class EmailService {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  sendWelcomeEmail(email: string, name: string, role: AccountType) {
    const frontendUrl = this.configService.get<string>(EnvConfig.FRONTEND_URL);

    if (role === AccountType.INDIVIDUAL) {
      const mailOptions = emailTemplateBuilder(
        'welcome-individual.hbs',
        email,
        'Welcome to Elite Wholesalers',
        'Welcome',
        {
          name,
          title: 'Welcome to Elite Wholesalers',
          url: `${frontendUrl}/dashboard`,
        },
      );
      return emailSenderConfig(mailOptions);
    } else {
      const mailOptions = emailTemplateBuilder(
        'welcome-trader.hbs',
        email,
        'Welcome to Elite Wholesalers',
        'Welcome',
        {
          name,
          title: 'Welcome to Elite Wholesalers',
          url: `${frontendUrl}/dashboard`,
        },
      );
      return emailSenderConfig(mailOptions);
    }
  }

  async sendOTPVerificationEmail(
    email: string,
    data: { otp: string; name: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'otp.hbs',
      email,
      `Elite Wholesalers OTP - ${data.otp} is your verification code`,
      'Verification',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Email Verification
  async sendEmailVerificationLink(
    email: string,
    data: { verificationLink: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'email-verification.hbs',
      email,
      'Verify Your Email',
      'Verify Email',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // Password Reset
  async sendPasswordResetEmail(
    email: string,
    data: { userName: string; resetLink: string },
  ) {
    const mailOptions = emailTemplateBuilder(
      'password-reset.hbs',
      email,
      'Reset Your Password',
      'Reset Password',
      data,
    );
    return emailSenderConfig(mailOptions);
  }

  // New Application Received (Employer)
  async sendNewApplicationEmail(
    email: string,
    data: {
      employerName: string;
      jobTitle: string;
      candidateName: string;
      shortBio: string;
      applicationDate: string;
      coverLetter: string;
      applicationLink: string;
    },
  ) {
    const mailOptions = emailTemplateBuilder(
      'new-candidate.hbs',
      email,
      'New Application Received',
      'New Application',
      data,
    );
    return emailSenderConfig(mailOptions);
  }
}
