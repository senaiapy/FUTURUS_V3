"use client";

import { ReactNode } from "react";
import { usePermissions, getRouteKeyFromPath } from "@/contexts/PermissionsContext";
import { usePathname } from "next/navigation";
import AccessDenied from "./AccessDenied";
import { Lock, Eye } from "lucide-react";

interface PermissionGuardProps {
  children: ReactNode;
  routeKey?: string;
  requireWrite?: boolean;
  fallback?: ReactNode;
  showReadOnlyBanner?: boolean;
}

/**
 * PermissionGuard - Protects routes/sections based on user permissions
 *
 * Usage:
 * <PermissionGuard routeKey="users">
 *   <UsersPage />
 * </PermissionGuard>
 *
 * Or with auto-detection from pathname:
 * <PermissionGuard>
 *   <PageContent />
 * </PermissionGuard>
 */
export default function PermissionGuard({
  children,
  routeKey,
  requireWrite = false,
  fallback,
  showReadOnlyBanner = true,
}: PermissionGuardProps) {
  const pathname = usePathname();
  const { canAccess, canWrite, isAdmin, isLoading } = usePermissions();

  // Auto-detect route key from pathname if not provided
  const effectiveRouteKey = routeKey || getRouteKeyFromPath(pathname);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  // Super admin has full access
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check access permission
  const hasAccess = canAccess(effectiveRouteKey);
  const hasWriteAccess = canWrite(effectiveRouteKey);

  // No access - show access denied or fallback
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <AccessDenied
        message={`You don't have access to ${effectiveRouteKey}`}
        showLogout={false}
        showBack={true}
      />
    );
  }

  // Requires write but user only has read access
  if (requireWrite && !hasWriteAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <AccessDenied
        message={`You don't have write access to ${effectiveRouteKey}`}
        showLogout={false}
        showBack={true}
      />
    );
  }

  // Read-only mode banner
  const isReadOnly = hasAccess && !hasWriteAccess;

  return (
    <>
      {showReadOnlyBanner && isReadOnly && (
        <ReadOnlyBanner />
      )}
      {children}
    </>
  );
}

/**
 * ReadOnlyBanner - Shows a banner indicating the user is in read-only mode
 */
function ReadOnlyBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
      <Eye className="w-5 h-5 text-amber-500 shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-medium text-amber-400">Read-Only Mode</p>
        <p className="text-xs text-amber-500/70">You can view but not modify content on this page</p>
      </div>
      <Lock className="w-4 h-4 text-amber-500/50" />
    </div>
  );
}

/**
 * WriteGuard - Only renders children if user has write access
 *
 * Usage:
 * <WriteGuard routeKey="users">
 *   <DeleteButton />
 * </WriteGuard>
 */
export function WriteGuard({
  children,
  routeKey,
  fallback = null,
}: {
  children: ReactNode;
  routeKey?: string;
  fallback?: ReactNode;
}) {
  const pathname = usePathname();
  const { canWrite, isAdmin, isLoading } = usePermissions();

  const effectiveRouteKey = routeKey || getRouteKeyFromPath(pathname);

  if (isLoading) {
    return null;
  }

  if (isAdmin || canWrite(effectiveRouteKey)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

/**
 * AdminOnly - Only renders for super admin
 *
 * Usage:
 * <AdminOnly>
 *   <PermissionsLink />
 * </AdminOnly>
 */
export function AdminOnly({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin, isLoading } = usePermissions();

  if (isLoading) {
    return null;
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
