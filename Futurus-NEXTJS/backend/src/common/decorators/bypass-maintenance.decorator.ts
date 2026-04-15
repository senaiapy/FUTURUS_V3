import { SetMetadata } from '@nestjs/common';

export const BYPASS_MAINTENANCE_KEY = 'bypassMaintenance';

/**
 * Decorator to bypass maintenance mode for specific routes
 * Usage: @BypassMaintenance() above controller or route handler
 */
export const BypassMaintenance = () =>
  SetMetadata(BYPASS_MAINTENANCE_KEY, true);
