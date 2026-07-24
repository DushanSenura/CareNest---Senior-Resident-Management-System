import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { S3Client } from '@aws-sdk/client-s3';

export const REDIS = Symbol('REDIS');
export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

@Global()
@Module({
  providers: [
    { provide: REDIS, inject: [ConfigService], useFactory: (config: ConfigService) => new Redis(config.get('REDIS_URL', 'redis://localhost:6379'), { lazyConnect: true }) },
    { provide: OBJECT_STORAGE, inject: [ConfigService], useFactory: (config: ConfigService) => new S3Client({
      endpoint: config.get('S3_ENDPOINT'), region: config.get('S3_REGION', 'us-east-1'),
      forcePathStyle: config.get('S3_FORCE_PATH_STYLE', 'true') === 'true',
      credentials: { accessKeyId: config.get('S3_ACCESS_KEY', ''), secretAccessKey: config.get('S3_SECRET_KEY', '') },
    }) },
  ],
  exports: [REDIS, OBJECT_STORAGE],
})
export class InfrastructureModule {}
