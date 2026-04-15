import { IsNumber, IsBoolean, IsOptional, IsObject } from 'class-validator';

export interface RoutePermission {
  access: 'lock' | 'access';
  mode: 'read' | 'read_write';
}

export interface PermissionsMap {
  dashboard?: RoutePermission;
  categories?: RoutePermission;
  subcategories?: RoutePermission;
  markets?: RoutePermission;
  users?: RoutePermission;
  deposits?: RoutePermission;
  withdrawals?: RoutePermission;
  reports?: RoutePermission;
  support?: RoutePermission;
  game?: RoutePermission;
  settings?: RoutePermission;
  grupos?: RoutePermission;
  'futurus-coin'?: RoutePermission;
  'ia-control'?: RoutePermission;
  [key: string]: RoutePermission | undefined;
}

export class CreatePermissionDto {
  @IsNumber()
  userId: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  permissions?: PermissionsMap;
}

export class UpdatePermissionDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsObject()
  @IsOptional()
  permissions?: PermissionsMap;
}

// Default permissions structure - all locked, read-only
export const DEFAULT_PERMISSIONS: PermissionsMap = {
  dashboard: { access: 'lock', mode: 'read' },
  categories: { access: 'lock', mode: 'read' },
  subcategories: { access: 'lock', mode: 'read' },
  markets: { access: 'lock', mode: 'read' },
  users: { access: 'lock', mode: 'read' },
  deposits: { access: 'lock', mode: 'read' },
  withdrawals: { access: 'lock', mode: 'read' },
  reports: { access: 'lock', mode: 'read' },
  support: { access: 'lock', mode: 'read' },
  game: { access: 'lock', mode: 'read' },
  settings: { access: 'lock', mode: 'read' },
  grupos: { access: 'lock', mode: 'read' },
  'futurus-coin': { access: 'lock', mode: 'read' },
  'ia-control': { access: 'lock', mode: 'read' },
};

// List of all admin routes for reference
export const ADMIN_ROUTES = [
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { key: 'categories', label: 'Categories', path: '/dashboard/categories' },
  {
    key: 'subcategories',
    label: 'Subcategories',
    path: '/dashboard/subcategories',
  },
  { key: 'markets', label: 'Markets', path: '/dashboard/markets' },
  { key: 'users', label: 'Manage Users', path: '/dashboard/users' },
  { key: 'deposits', label: 'Deposits', path: '/dashboard/deposits' },
  { key: 'withdrawals', label: 'Withdrawals', path: '/dashboard/withdrawals' },
  { key: 'reports', label: 'Reports', path: '/dashboard/reports' },
  { key: 'support', label: 'Support', path: '/dashboard/support' },
  { key: 'game', label: 'Game', path: '/dashboard/game' },
  { key: 'settings', label: 'Settings', path: '/dashboard/settings' },
  { key: 'grupos', label: 'Grupos', path: '/dashboard/grupos' },
  {
    key: 'futurus-coin',
    label: 'Futurus Coin',
    path: '/dashboard/futurus-coin',
  },
  { key: 'ia-control', label: 'IA Control', path: '/dashboard/ia-control' },
];
