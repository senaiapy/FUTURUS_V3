import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

/**
 * AdminGuard - Protects admin-only endpoints
 * Verifies that the request has a valid JWT token from an authenticated admin or user with permissions
 *
 * Roles:
 * - 'admin': Super admin from Admin model - full access to all routes
 * - 'user_admin': User from User model with AdminPermission - access based on permissions
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>(
      'isPublic',
      context.getHandler(),
    );
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Admin authentication required');
    }

    const token = authHeader.substring(7);

    try {
      const payload = this.jwtService.verify(token);
      request.admin = payload;

      // Super admin has full access
      if (payload.role === 'admin') {
        return true;
      }

      // User admin - check permissions
      if (payload.role === 'user_admin') {
        return this.checkUserPermissions(request, payload);
      }

      // Unknown role
      throw new UnauthorizedException('Invalid admin role');
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired admin token');
    }
  }

  private checkUserPermissions(request: any, payload: any): boolean {
    const permissions = payload.permissions || {};
    const path = request.path || request.url || '';
    const method = request.method?.toUpperCase();

    // Extract route key from path (e.g., '/admin/users/123' -> 'users')
    const routeKey = this.extractRouteKey(path);

    // Check if route exists in permissions
    const routePermission = permissions[routeKey];

    // If no permission defined for this route, deny access
    if (!routePermission) {
      throw new ForbiddenException(`Access denied to ${routeKey}`);
    }

    // Check if access is granted
    if (routePermission.access === 'lock') {
      throw new ForbiddenException(`Access to ${routeKey} is locked`);
    }

    // Check write permission for modifying requests
    const isWriteRequest = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (isWriteRequest && routePermission.mode !== 'read_write') {
      throw new ForbiddenException(
        `Write access to ${routeKey} is not permitted`,
      );
    }

    return true;
  }

  private extractRouteKey(path: string): string {
    // Remove /api and /admin prefix
    let cleanPath = path.replace(/^\/api/, '').replace(/^\/admin/, '');

    // Split and get the first meaningful segment
    const segments = cleanPath.split('/').filter((s) => s && !s.match(/^\d+$/));

    // Map path segments to route keys
    const pathToRouteMap: Record<string, string> = {
      dashboard: 'dashboard',
      categories: 'categories',
      subcategories: 'subcategories',
      markets: 'markets',
      users: 'users',
      deposits: 'deposits',
      withdrawals: 'withdrawals',
      reports: 'reports',
      support: 'support',
      game: 'game',
      settings: 'settings',
      grupos: 'grupos',
      'futurus-coin': 'futurus-coin',
      'ia-control': 'ia-control',
      blockchain: 'blockchain', // Blockchain management
      notifications: 'dashboard', // Notifications accessible from dashboard
      chart: 'dashboard', // Chart data accessible from dashboard
      system: 'settings', // System info accessible from settings
      cron: 'settings', // Cron jobs accessible from settings
      extensions: 'settings', // Extensions accessible from settings
      transactions: 'reports', // Alias for reports
      purchases: 'reports', // Alias for reports
      logins: 'reports', // Alias for reports
      subscribers: 'users', // Subscribers management
      comments: 'markets', // Comments related to markets
      permissions: '__admin_only__', // Permissions are admin-only
    };

    const firstSegment = segments[0] || 'dashboard';
    const routeKey = pathToRouteMap[firstSegment];

    // If route is admin-only, keep it as such for permission check to deny
    if (routeKey === '__admin_only__') {
      return '__admin_only__';
    }

    return routeKey || 'dashboard';
  }
}

// Extend the Express Request type to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: {
        username: string;
        sub: number;
        role: 'admin' | 'user_admin';
        permissions?: Record<
          string,
          { access: 'lock' | 'access'; mode: 'read' | 'read_write' }
        >;
      };
    }
  }
}
