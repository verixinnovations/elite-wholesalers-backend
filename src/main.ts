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
} from '@nestjs/common';
import { ResponseInterceptor } from './common/interceptors/response.interceptors';
import { GlobalExceptionFilter } from './common/errors/filters.error';

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
  customSiteTitle: 'Badge API Docs',
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          error: Object.values(error.constraints || {}),
        }));
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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJkZy1oYzlwazhhcyIsInJvbGUiOiJVU0VSIiwic3ViIjoiYTA2YjY1ZmUtOTIwNS00NGYxLTg4OWEtMTIxNjRiNmNiNTM5IiwiaWF0IjoxNzcxMDk3Nzc0fQ.4vHT955Ad1vn7fIdwqGpl_vtgXDJXSruneSClqsF7fA';

  const config = new DocumentBuilder()
    .setTitle('Badge API')
    .setDescription('Badge API documentation')
    .setVersion('1.0')
    .addTag('Badge API Documentation')
    // .addBearerAuth(
    //   {
    //     type: 'http',
    //     scheme: 'bearer',
    //     bearerFormat: 'JWT',
    //     name: 'Authorization',
    //     description: BEARER_TOKEN,
    //     in: 'header',
    //   },
    //   SECURITY_NAME,
    // )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      name: 'authorization',
      'x-tokenName': BEARER_TOKEN,
    })
    .setContact('Support', 'https://badge.com/support', '')
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
        title: 'Badge Documentation',
        description: 'API Documentation for Badge application.',
        ogTitle: 'Badge Documentation',
        ogDescription: 'API Documentation for Badge application.',
        ogImage: 'https://example.com/image.png',
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

      // customCss: `
      // // @import url('https://fonts.googleapis.com/css2?family=Stack+Sans+Text:wght@200..700&display=swap');
      // // :root { --scalar-font: 'Stack Sans Text', sans-serif;}
      // `,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap()
  .then(() => {
    console.log('Application is running on port', process.env.PORT ?? 3000);
  })
  .catch((err) => {
    console.error('Error during application bootstrap:', err);
  });
