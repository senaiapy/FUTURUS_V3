import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  UpdatePermissionDto,
  ADMIN_ROUTES,
} from './dto/permission.dto';
import { AdminGuard } from '../admin/admin.guard';

@Controller('admin/permissions')
@UseGuards(AdminGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // Middleware to ensure only super admin can access
  private ensureSuperAdmin(request: any) {
    const admin = request.admin;
    // Super admin has role 'admin' (from Admin model login)
    // Staff users have role 'user_admin' (from User model with permissions)
    if (admin?.role !== 'admin') {
      throw new ForbiddenException('Only super admin can manage permissions');
    }
  }

  // Get all available routes for configuration
  @Get('routes')
  getRoutes(@Req() req: any) {
    this.ensureSuperAdmin(req);
    return ADMIN_ROUTES;
  }

  // Get all users with admin permissions
  @Get()
  async getAllPermissions(@Req() req: any) {
    this.ensureSuperAdmin(req);
    return this.permissionsService.getAllPermissions();
  }

  // Get users without permissions (for adding new staff)
  @Get('available-users')
  async getAvailableUsers(@Req() req: any) {
    this.ensureSuperAdmin(req);
    return this.permissionsService.getUsersWithoutPermission();
  }

  // Get permission for a specific user
  @Get(':userId')
  async getPermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    this.ensureSuperAdmin(req);
    return this.permissionsService.getPermissionByUserId(userId);
  }

  // Check route access for a user (can be used by the admin guard)
  @Get('check/:userId/:routeKey')
  async checkRouteAccess(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('routeKey') routeKey: string,
    @Req() req: any,
  ) {
    // This endpoint can be called by the system, not just super admin
    return this.permissionsService.checkRouteAccess(userId, routeKey);
  }

  // Create permission for a user (add to admin group)
  @Post()
  async createPermission(@Body() dto: CreatePermissionDto, @Req() req: any) {
    this.ensureSuperAdmin(req);
    return this.permissionsService.createPermission(dto);
  }

  // Update permission for a user
  @Put(':userId')
  async updatePermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: UpdatePermissionDto,
    @Req() req: any,
  ) {
    this.ensureSuperAdmin(req);
    return this.permissionsService.updatePermission(userId, dto);
  }

  // Delete permission (remove from admin group)
  @Delete(':userId')
  async deletePermission(
    @Param('userId', ParseIntPipe) userId: number,
    @Req() req: any,
  ) {
    this.ensureSuperAdmin(req);
    return this.permissionsService.deletePermission(userId);
  }
}
