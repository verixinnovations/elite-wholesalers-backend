// import { Schema } from 'mongoose';
import { User, UserRoles } from '../../modules/user/entities/user.entity';
import { Request } from 'express';

type ShallowCopy<T> = {
  [P in keyof T]?: T[P];
} & {
  [key: string]: any;
};

export interface JwtPayload {
  username: string;
  role: UserRoles;
  sub: string;
}

export interface AuthResponse {
  id?: string;
  user: ShallowCopy<User>;
  role: UserRoles;
  access_token: string;
}

export interface IRequest extends Request {
  user: User;
}
