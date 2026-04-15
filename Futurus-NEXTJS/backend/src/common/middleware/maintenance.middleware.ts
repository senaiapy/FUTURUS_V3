import {
  Injectable,
  NestMiddleware,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
  constructor(private prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Skip maintenance check for admin routes
    if (req.path.startsWith('/admin') || req.path.startsWith('/api/admin')) {
      return next();
    }

    // Skip for maintenance status endpoint (so frontend can check status)
    if (req.path.includes('/settings/status')) {
      return next();
    }

    try {
      // Get maintenance mode setting from database
      const settings = await this.prisma.generalSetting.findFirst();

      if (settings?.maintenanceMode === 1) {
        throw new ServiceUnavailableException({
          statusCode: 503,
          message: 'System under maintenance',
          maintenanceMessage:
            settings.maintenanceMessage ||
            'We are performing scheduled maintenance. We will be back soon!',
        });
      }
    } catch (error) {
      // If it's already a ServiceUnavailableException, re-throw it
      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      // For other errors (like DB connection), log and allow request to proceed
      console.error('Maintenance check error:', error);
    }

    next();
  }
}
