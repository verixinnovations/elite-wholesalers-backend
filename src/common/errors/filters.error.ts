import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

interface FieldError {
  field: string;
  errors: string[];
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // 1. Determine Status Code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // 2. Default Values
    let message = 'Internal server error';
    let statusMessage = 'Error';
    let fieldErrors: FieldError[] | null = null;

    // 3. Extract Error Details
    if (exception instanceof HttpException) {
      const res: any = exception.getResponse();
      statusMessage = httpStatusMessage(status);

      // CASE A: The response is a simple string (e.g. throw new HttpException('Stop', 400))
      if (typeof res === 'string') {
        message = res;
      }
      // CASE B: The response is an object (Standard NestJS Exceptions)
      else if (typeof res === 'object' && res !== null) {
        // Check for your CUSTOM validation structure (Array of objects with 'field')
        if (
          Array.isArray(res.message) &&
          res.message.length > 0 &&
          res.message[0].field
        ) {
          message = 'Validation Failed';
          statusMessage = 'Validation Error';
          fieldErrors = res.message as FieldError[];
        }
        // Check for STANDARD NestJS validation (Array of strings - fail safe)
        else if (Array.isArray(res.message)) {
          message = res.message.join(', ');
          statusMessage = res.error || statusMessage;
        }
        // Standard Error Object (e.g. { message: 'Not Found', error: 'Not Found', statusCode: 404 })
        else {
          message = res.message || exception.message;
          statusMessage = res.error || statusMessage;
        }
      }
    }
    // CASE C: Non-Http Errors (DB Errors, System Failures)
    else if (exception instanceof Error) {
      message = exception.message;
      statusMessage = exception.name;

      // Handle Postgres Unique Constraint (Code 23505)
      if ((exception as any).code === '23505') {
        statusMessage = 'Conflict';
        const match = (exception as any).detail.match(/\((.*?)\)=\((.*?)\)/);
        if (match) {
          fieldErrors = [
            { field: match[1], errors: [`${match[1]} already exists`] },
          ];
          message = 'Validation Failed';
        }
      }
    }

    // 4. Log Critical Errors (500s)
    if (status === (HttpStatus.INTERNAL_SERVER_ERROR as number)) {
      this.logger.error(exception);
    }

    // 5. Send Response
    response.status(status).json({
      meta: {
        success: false,
        statusCode: status,
        statusMessage: statusMessage,
      },
      error: {
        path: request.url,
        message: message,
        errors: fieldErrors,
      },
      timestamp: new Date().toISOString(),
    });
  }
}

// Helper to get standard HTTP status names (e.g., 404 -> 'Not Found')
function httpStatusMessage(status: number): string {
  // You can use the 'http' module or a simple map.
  // NestJS doesn't export the text map by default, so we default to 'Error'
  // or rely on the exception's internal error name.
  return 'Error';
}
