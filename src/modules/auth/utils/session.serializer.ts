// /* eslint-disable @typescript-eslint/no-unsafe-function-type */
// import { Injectable } from '@nestjs/common';
// import { PassportSerializer } from '@nestjs/passport';
// import { AuthService } from '../auth.service';
// import { User } from 'src/user/entities/user.entity';

// @Injectable()
// export class SessionSerializer extends PassportSerializer {
//   constructor(private readonly authService: AuthService) {
//     super();
//   }

//   serializeUser(user: User, done: Function) {
//     console.log({ serializeUser: 'We are serializing the user' });
//     done(null, user);
//   }

//   async deserializeUser(payload: User, done: Function) {
//     console.log({ payload });
//     const user = await this.authService.find({ email: payload.email });
//     console.log({ deSerializeUser: 'We are deserializing the user' });
//     return user ? done(null, user) : done(null, null);
//   }
// }
