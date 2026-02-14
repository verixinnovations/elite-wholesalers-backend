import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse, JwtPayload } from 'src/common/interface';
import { User } from 'src/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/user.service';
import { BcryptConfig } from 'src/common/utils/bcrypt.utils';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { EmailService } from 'src/services/emails/email.service';
import { OAuth2Client } from 'google-auth-library';
import { Verification } from './entities/auth.entity';
import { uniqueNumber } from 'src/common/utils/unique-numbers';
import { ResetPasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private emailService: EmailService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    await this.emailService.sendWelcomeEmail(
      user.email,
      `${user.lastname} ${user.firstname}`,
    );
    return this.userRepository.save(user);
  }

  login(user: User): AuthResponse {
    const payload: JwtPayload = {
      username: user.username,
      role: user.role,
      sub: user.id,
    };

    return {
      id: user.id,
      user,
      role: payload.role,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      const validPass = await BcryptConfig.comparePassword(
        password,
        user.password,
      );
      if (validPass) {
        return user;
      } else return null;
    } else return null;
  }

  getAuthUser(id: string) {
    return this.userService.findOne({ id });
  }

  async forgotPassword(email: string) {
    try {
      const verification_code = uniqueNumber.generateOtp().toString();
      const user = await this.userService.findOne({ email });
      if (user) {
        const verificationCreated = await this.createVerificationCode(
          user.id,
          verification_code,
        );
        if (verificationCreated) {
          const email_is_sent = await this.emailService.sendVerificationEmail(
            user.email,
            {
              otp: verification_code,
              name: user.fullname,
            },
          );

          if (email_is_sent)
            return { message: 'verification code sent successfully' };
          else throw new Error('Unable to send e-mail');
        }
      } else throw new NotFoundException('No user with the email found');
    } catch (e: unknown) {
      throw new InternalServerErrorException(e);
    }
  }

  async googleLogin(token: string): Promise<AuthResponse> {
    try {
      // 1. Exchange the code for the actual tokens
      const { tokens } = await this.googleClient.getToken({
        code: token,
        redirect_uri: 'postmessage',
      });
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const googlePayload = ticket.getPayload();
      if (!googlePayload) throw new UnauthorizedException();

      const { email, given_name, family_name, picture } = googlePayload;
      let user = await this.userRepository.findOneBy({ email });

      if (!user) {
        user = new User();
        user.firstname = given_name ?? 'new';
        user.lastname = family_name ?? 'user';
        user.email = email!;
        user.picture = picture ?? '';
        user = await this.userRepository.save(user);
        await this.emailService.sendWelcomeEmail(
          email!,
          `${family_name ?? ''} ${given_name ?? ''}`.trim(),
        );
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }

  findAll() {
    return this.userService.findAllUser();
  }

  async createVerificationCode(userId: string, verification_code: string) {
    let verification = await this.verificationRepository.findOne({
      where: { userId },
    });

    if (verification) {
      verification.verification_code = verification_code;
      verification.expire_at = uniqueNumber.generateOtpExpiryTime();
    } else {
      verification = this.verificationRepository.create({
        userId,
        verification_code,
        expire_at: uniqueNumber.generateOtpExpiryTime(),
      });
    }

    const savedRecord = await this.verificationRepository.save(verification);
    return savedRecord;
  }

  async resetPassword(data: ResetPasswordDto) {
    const { email, password, verification_code } = data;

    // 1. Find User
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        'Email not recognized. Please enter your correct email.',
      );
    }

    // 2. Find Verification Record
    const verificationRecord = await this.verificationRepository.findOne({
      where: { userId: user.id },
    });

    if (!verificationRecord) {
      throw new UnauthorizedException('Verification code timeout or invalid.');
    }
    if (verificationRecord.verification_code !== verification_code) {
      throw new BadRequestException('Incorrect verification code.');
    }
    if (new Date() > verificationRecord.expire_at) {
      await this.verificationRepository.delete({ userId: user.id }); // Clean up expired
      throw new BadRequestException('Verification code has expired.');
    }
    console.log({ verificationRecord });

    user.password = await BcryptConfig.hashPassword(password);
    await this.userRepository.save(user);
    await this.verificationRepository.delete({ userId: user.id });
    return { message: 'Password reset successfully' };
  }
}

// @Cron(CronExpression.EVERY_MINUTE) // Runs every 60 seconds
// async removeExpiredCodes() {
//   // Delete where "expire_at" is LESS THAN "now"
//   const now = new Date();

//   const result = await this.verificationRepo.delete({
//     expire_at: LessThan(now),
//   });

//   if (result.affected && result.affected > 0) {
//     console.log(`Deleted ${result.affected} expired verification codes`);
//   }
// }
