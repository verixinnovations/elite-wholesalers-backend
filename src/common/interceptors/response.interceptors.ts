import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as http from 'http';

export interface Response<T> {
  meta: {
    success: boolean;
    statusCode: number;
    statusMessage: string;
  };
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // 1. Get response/status INSIDE the map to ensure we get the final status
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        const statusCode = response.statusCode;
        const statusMessage = http.STATUS_CODES[statusCode] || 'SUCCESS';

        // 2. Return the wrapper
        return {
          meta: { success: true, statusCode, statusMessage },
          data: data, // Don't touch data here. Let Serialization handle it.
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
