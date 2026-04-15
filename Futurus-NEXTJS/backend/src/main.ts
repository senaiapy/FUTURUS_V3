import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  // Serve normal uploads
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Check if running inside Docker for KYC uploads
  const isDocker = process.env.DATABASE_URL?.includes('db:') || false;
  const laravelVerifyPath = isDocker 
      ? '/app/laravel_verify'
      : join(__dirname, '../../../../Futurus-LARAVEL/assets/verify');

  // Serve KYC verify documents to the Admin Panel
  app.use('/verify', express.static(laravelVerifyPath));

  // Use global interceptor to transform all responses to { success, message, data }
  app.useGlobalInterceptors(new TransformInterceptor());

  // Enable CORS for frontend communication
  // SECURITY: Restrict origins to specific domains from CORS_ORIGINS environment variable
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('CORS policy violation: Origin not allowed'), false);
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global prefix for all routes (to match mobile app expectation)
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Backend running on: http://localhost:${port}/api`);
}
void bootstrap();
