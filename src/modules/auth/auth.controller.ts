import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LocalAuthGuard } from '../../common/middleware/local-auth-guard.middleware';
import { Public } from '../../common/decorators';
import { type IRequest } from '../../common/interface';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { JwtAuthGuard } from '../../common/middleware/jwt-auth-guard.middleware';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Create Account' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ summary: 'Login' })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  login(@Req() req: IRequest, @Body() body: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('/google/signin')
  @Public()
  @ApiOperation({ summary: 'Google Login' })
  googleSignin(@Body() data: GoogleLoginDto) {
    return this.authService.googleLogin(data.token);
  }

  @Get('/google/redirect')
  @ApiOperation({ summary: 'Google Redirect' })
  googleRedirect() {
    return { success: 'Redirected' };
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({ summary: 'Forgot Password' })
  forgotPassword(@Body() data: ForgotPasswordDto) {
    return this.authService.forgotPassword(data.email);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Reset password' })
  resetPassword(@Body() data: ResetPasswordDto) {
    return this.authService.resetPassword(data);
  }

  @ApiBearerAuth()
  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Auth user' })
  authUser(@Req() req: IRequest) {
    return this.authService.getAuthUser(req.user.id);
  }
}
