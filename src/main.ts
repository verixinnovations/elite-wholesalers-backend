import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';

import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import { GlobalExceptionFilter } from './common/errors/filters.error';

function flattenValidationErrors(
  errors: ValidationError[],
  parentPath = '',
): { field: string; error: string[] }[] {
  return errors.flatMap((validationError) => {
    const field = parentPath
      ? `${parentPath}.${validationError.property}`
      : validationError.property;
    const messages = Object.values(validationError.constraints || {});

    return [
      ...(messages.length ? [{ field, error: messages }] : []),
      ...flattenValidationErrors(validationError.children || [], field),
    ];
  });
}

const swaggerOptions: SwaggerCustomOptions = {
  useGlobalPrefix: false,
  // swaggerUiEnabled: true,
  jsonDocumentUrl: '/api/docs-json/download',
  // yamlDocumentUrl: '/api/docs-yaml/download',
  // explorer: true,
  // swaggerOptions?: SwaggerUiOptions;
  customCss: 'swagger',
  // customCssUrl: ['/styles/scalar.css', '/styles/swagger.css'],
  // customfavIcon?: "";
  customSiteTitle: 'Elite Wholesalers API Docs',
};

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  // {
  //   origin: [
  //     'http://localhost:3000',
  //     'http://localhost:5173',
  //     'https://elite-wholesalers-frontend.vercel.app',
  //   ],
  //   credentials: false,
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  // }

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = flattenValidationErrors(errors);
        return new BadRequestException(formattedErrors);
      },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new ResponseInterceptor());
  // app.useGlobalPipes(new ValidationPipe());
  const SECURITY_NAME = 'Access-Token';
  const BEARER_TOKEN =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImV3aGxzLTYwMWZ3Z3VsIiwiYWNjb3VudFR5cGUiOiJJTkRJVklEVUFMIiwiem9ob0NvbnRhY3RJZCI6IjE5NjkyNDAwMDAwMzgzODUwNzMiLCJzdWIiOiJhNzQ1NjgxNS1iODc1LTQ3NjEtOTRmYi1mNTVhZmVkMGFlOTUiLCJpYXQiOjE3OTExMDA4ODgsImV4cCI6MTc5MTcwNTY4OH0.KLkdYlIwklX9ABRK1awcAi6jxheonQUFprwb5s9S20Y';

  const config = new DocumentBuilder()
    .setTitle('Elite Wholesalers API')
    .setDescription('Elite Wholesalers API documentation')
    .setVersion('1.0')
    .addTag('Elite Wholesalers API Documentation')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: BEARER_TOKEN,
        in: 'header',
      },
      SECURITY_NAME,
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      name: 'authorization',
      'x-tokenName': BEARER_TOKEN,
    })
    .setContact(
      'Support',
      process.env.SUPPORT_URL ?? 'https://elitewholesalers.com/support',
      '',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addSecurityRequirements(SECURITY_NAME)
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/swagger-docs', app, documentFactory, swaggerOptions);
  const { apiReference } = await import('@scalar/nestjs-api-reference');
  app.use(
    '/api/docs',
    apiReference({
      content: documentFactory,
      theme: 'bluePlanet',
      layout: 'modern',

      metaData: {
        title: 'Elite Wholesalers Documentation',
        description: 'API Documentation for Elite Wholesalers.',
        ogTitle: 'Elite Wholesalers Documentation',
        ogDescription: 'API Documentation for Elite Wholesalers.',
        ogImage:
          process.env.DOCUMENTATION_IMAGE_URL ??
          'https://elitewholesalers.com/og-image.png',
        twitterCard: 'summary_large_image',
      },
      authentication: {
        securitySchemes: {
          [SECURITY_NAME]: {
            type: 'http',
            scheme: 'bearer',
            token: BEARER_TOKEN,
          },
        },
      },
      persistAuth: true,

      customCss: `
      // @import url('https://fonts.googleapis.com/css2?family=Stack+Sans+Text:wght@200..700&display=swap');
      // :root { --scalar-font: 'Stack Sans Text', sans-serif;}
      `,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 5050);
}

const logger = new Logger('StartUpLoader');

const BLUE = '\x1b[34m';
bootstrap()
  .then(() => {
    logger.log(
      'Application is running on port: ' + BLUE + (process.env.PORT ?? 5050),
    );
  })
  .catch((err) => {
    logger.error('Error during application bootstrap:', err);
  });
