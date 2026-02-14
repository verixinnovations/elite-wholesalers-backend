import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LocalAuthGuard } from 'src/common/middleware/local-auth-guard.middleware';
import { Public } from 'src/common/decorators';
import { type IRequest } from 'src/common/interface';
import { CreateUserDto } from 'src/modules/user/dto/create-user.dto';
import { JwtAuthGuard } from 'src/common/middleware/jwt-auth-guard.middleware';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create Account' })
  @Post('register')
  @Public()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.createUser(createUserDto);
  }

  @Public()
  @ApiOperation({ summary: 'Login' })
  @Public()
  @Post('login')
  @UseGuards(LocalAuthGuard)
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
