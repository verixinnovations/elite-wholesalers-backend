// import { Injectable } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { PassportStrategy } from '@nestjs/passport';
// import { Profile, Strategy } from 'passport-google-oauth20';

// import { AuthService } from '../auth.service';
// import { EnvConfig } from 'src/common/config/env.config';
// import { AuthResponse, JwtPayload } from 'src/common/interface';
// import { JwtService } from '@nestjs/jwt';

// @Injectable()
// export class GoogleOAuthStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private authService: AuthService,
//     private configService: ConfigService,
//     private jwtService: JwtService,
//   ) {
//     super({
//       clientID: configService.get<string>(EnvConfig.GOOGLE_CLIENT_ID),
//       clientSecret: configService.get<string>(EnvConfig.GOOGLE_CLIENT_SECRET),
//       callbackURL: configService.get<string>(EnvConfig.GOOGLE_CALLBACK_URL),
//       scope: ['profile', 'email'],
//     });
//   }

//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: Profile,
//   ): Promise<AuthResponse> {
//     const user = await this.authService.googleSignup(
//       {
//         lastname: profile.name.familyName,
//         firstname: profile.name.givenName,
//         email: profile._json.email,
//         username: profile.id,
//         password: crypto.randomUUID().slice(0, 8),
//       },
//       profile.id,
//     );
//     const payload: JwtPayload = {
//       sub: user.id as string,
//       username: user.username,
//       role: user.role,
//     };

//     return {
//       id: user.id as string,
//       user: user,
//       role: user.role,
//       access_token: this.jwtService.sign(payload),
//     };
//   }
// }
