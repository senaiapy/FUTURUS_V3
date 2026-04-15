import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  DEFAULT_PERMISSIONS,
  PermissionsMap,
  RoutePermission,
} from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Get all users with admin permissions
  async getAllPermissions() {
    const permissions = await this.prisma.adminPermission.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            image: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return permissions.map((p) => ({
      ...p,
      permissions: p.permissions
        ? JSON.parse(p.permissions)
        : DEFAULT_PERMISSIONS,
    }));
  }

  // Get permission by user ID
  async getPermissionByUserId(userId: number) {
    const permission = await this.prisma.adminPermission.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            image: true,
            status: true,
          },
        },
      },
    });

    if (!permission) {
      return null;
    }

    return {
      ...permission,
      permissions: permission.permissions
        ? JSON.parse(permission.permissions)
        : DEFAULT_PERMISSIONS,
    };
  }

  // Create new permission for a user
  async createPermission(dto: CreatePermissionDto) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Check if permission already exists
    const existing = await this.prisma.adminPermission.findUnique({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException(
        `Permission already exists for user ID ${dto.userId}`,
      );
    }

    // Merge provided permissions with defaults
    const permissions = { ...DEFAULT_PERMISSIONS, ...(dto.permissions || {}) };

    const permission = await this.prisma.adminPermission.create({
      data: {
        userId: dto.userId,
        isActive: dto.isActive ?? false,
        permissions: JSON.stringify(permissions),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            image: true,
            status: true,
          },
        },
      },
    });

    return {
      ...permission,
      permissions,
    };
  }

  // Update permission for a user
  async updatePermission(userId: number, dto: UpdatePermissionDto) {
    const existing = await this.prisma.adminPermission.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new NotFoundException(`Permission not found for user ID ${userId}`);
    }

    // Merge existing permissions with new ones
    const existingPermissions = existing.permissions
      ? JSON.parse(existing.permissions)
      : DEFAULT_PERMISSIONS;
    const permissions = dto.permissions
      ? { ...existingPermissions, ...dto.permissions }
      : existingPermissions;

    const permission = await this.prisma.adminPermission.update({
      where: { userId },
      data: {
        isActive: dto.isActive ?? existing.isActive,
        permissions: JSON.stringify(permissions),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            firstname: true,
            lastname: true,
            image: true,
            status: true,
          },
        },
      },
    });

    return {
      ...permission,
      permissions,
    };
  }

  // Delete permission (remove user from admin group)
  async deletePermission(userId: number) {
    const existing = await this.prisma.adminPermission.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new NotFoundException(`Permission not found for user ID ${userId}`);
    }

    await this.prisma.adminPermission.delete({ where: { userId } });
    return { message: `Permission deleted for user ID ${userId}` };
  }

  // Check if user can access a specific route
  async checkRouteAccess(
    userId: number,
    routeKey: string,
  ): Promise<{ canAccess: boolean; canWrite: boolean }> {
    const permission = await this.prisma.adminPermission.findUnique({
      where: { userId },
    });

    if (!permission || !permission.isActive) {
      return { canAccess: false, canWrite: false };
    }

    const permissions: PermissionsMap = permission.permissions
      ? JSON.parse(permission.permissions)
      : DEFAULT_PERMISSIONS;

    const routePermission: RoutePermission | undefined = permissions[routeKey];

    if (!routePermission || routePermission.access === 'lock') {
      return { canAccess: false, canWrite: false };
    }

    return {
      canAccess: true,
      canWrite: routePermission.mode === 'read_write',
    };
  }

  // Get all users without admin permissions (for adding new staff)
  async getUsersWithoutPermission() {
    const usersWithPermission = await this.prisma.adminPermission.findMany({
      select: { userId: true },
    });

    const userIdsWithPermission = usersWithPermission.map((p) => p.userId);

    return this.prisma.user.findMany({
      where: {
        id: { notIn: userIdsWithPermission },
        status: 1, // Only active users
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstname: true,
        lastname: true,
        image: true,
      },
      orderBy: { username: 'asc' },
    });
  }
}
