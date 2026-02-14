import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  greetings(): string {
    return '<h1>Hello Everyone!</h1>';
  }
}
