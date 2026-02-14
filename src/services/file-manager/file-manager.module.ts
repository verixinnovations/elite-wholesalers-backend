import { Module } from '@nestjs/common';
import { FileManagerService } from './file-manager.service';
import { CloudinaryModule } from 'nestjs-cloudinary';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../common/config/env.config';

@Module({
  imports: [
    CloudinaryModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        isGlobal: true,
        cloud_name: configService.get(EnvConfig.CLOUDINARY_CLOUD_NAME),
        api_key: configService.get(EnvConfig.CLOUDINARY_API_KEY),
        api_secret: configService.get(EnvConfig.CLOUDINARY_API_SECRET),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [],
  providers: [FileManagerService],
  exports: [FileManagerService],
})
export class FileManagerModule {}
