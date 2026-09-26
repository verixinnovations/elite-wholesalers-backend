// import { Schema } from 'mongoose';
import { User, AccountType } from '../../modules/user/entities/user.entity';
import { Request } from 'express';

type ShallowCopy<T> = {
  [P in keyof T]?: T[P];
} & {
  [key: string]: any;
};

export interface JwtPayload {
  username: string;
  accountType: AccountType;
  sub: string;
}

export interface AuthResponse {
  id?: string;
  user: ShallowCopy<User>;
  accountType: AccountType;
  access_token: string;
}

export interface IRequest extends Request {
  user: User;
}
