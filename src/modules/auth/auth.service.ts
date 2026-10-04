import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthResponse, JwtPayload } from '../../common/interface';
import { User } from '../user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { BcryptConfig } from '../../common/utils/bcrypt.utils';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { EmailService } from '../../services/emails/email.service';
import { OAuth2Client } from 'google-auth-library';
import { Verification } from './entities/auth.entity';
import { uniqueNumber } from '../../common/utils/unique-numbers';
import { ResetPasswordDto } from './dto/auth.dto';
import { DataSource } from 'typeorm';
import { ZohoPayloadGenerator } from '../zoho/dto/user-generator';
import { ZohoInventoryService } from '../zoho/zoho-inventory.service';

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
    private dataSource: DataSource,
    private zohoInventoryService: ZohoInventoryService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
  ) {}

  private readonly logger = new Logger(AuthService.name);

  async createUser(createUserDto: CreateUserDto) {
    // 1. Initialize and start the transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transactionalUserRepository = queryRunner.manager.withRepository(
        this.userRepository,
      );

      // 2. Create the object in memory (ID is undefined here)
      const user = transactionalUserRepository.create(createUserDto);

      // 3. Hash the password
      user.password = await BcryptConfig.hashPassword(createUserDto.password);

      // 4. Execute the INSERT statement (This generates the ID!)
      // Because it's a transaction, it is safely locked and pending.
      const savedUser = await transactionalUserRepository.save(user);

      this.logger.log(`User created with ID: ${savedUser.id}`); // ID IS NOW AVAILABLE!

      // 5. Generate Zoho Payload using the savedUser (which now has an ID)
      const zohoPayload =
        ZohoPayloadGenerator.generateContactCreationPayload(savedUser);

      const zohoResponse =
        await this.zohoInventoryService.createCustomer(zohoPayload);
      savedUser.zohoContactId = zohoResponse?.contact_id;

      const zohoUser = await transactionalUserRepository.save(savedUser);

      // 7. Commit the transaction (Makes the user permanent in the database)
      await queryRunner.commitTransaction();

      // 8. Send the email ONLY after everything (DB + Zoho) has succeeded
      await this.emailService.sendWelcomeEmail(
        savedUser.email,
        `${savedUser.lastname} ${savedUser.firstname}`,
        savedUser.accountType,
      );

      return zohoUser;
    } catch (error) {
      // 9. If anything fails (database error, Zoho error, etc.), rollback the local DB insert
      await queryRunner.rollbackTransaction();
      this.logger.error('User creation failed, rolling back.', error.message);
      throw error;
    } finally {
      // 10. Always release the connection back to the pool
      await queryRunner.release();
    }
  }

  login(user: User): AuthResponse {
    const payload: JwtPayload = {
      username: user.username,
      accountType: user.accountType,
      zohoContactId: user.zohoContactId,
      sub: user.id,
    };

    return {
      id: user.id,
      user,
      zohoContactId: user.zohoContactId,
      accountType: payload.accountType,
      access_token: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (user) {
      if (!user.password)
        throw new BadRequestException('Kindly reset your password to sign in.');
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
      const user = await this.userRepository.findOne({ where: { email } });
      if (user) {
        const verificationCreated = await this.createVerificationCode(
          user.id,
          verification_code,
        );
        if (verificationCreated) {
          const email_is_sent =
            await this.emailService.sendOTPVerificationEmail(user.email, {
              otp: verification_code,
              name: user.fullname,
            });

          if (email_is_sent)
            return { message: 'verification code sent successfully' };
          else throw new Error('Unable to send e-mail');
        }
      } else throw new NotFoundException('No user with the email found');
    } catch (e: unknown) {
      throw new BadRequestException(e);
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
          user.accountType,
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
